#!/usr/bin/env python3
"""
Create data snapshots for rollback functionality
Maintains 7 days of snapshots with automated cleanup
"""

import os
import json
import shutil
import pathlib
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "web" / "public" / "data"
SNAPSHOTS_DIR = DATA_DIR / "snapshots"

def create_snapshot_directory(date_str: str) -> pathlib.Path:
    """Create snapshot directory for given date"""
    snapshot_dir = SNAPSHOTS_DIR / date_str
    snapshot_dir.mkdir(parents=True, exist_ok=True)
    return snapshot_dir

def copy_data_files(snapshot_dir: pathlib.Path) -> Dict[str, Any]:
    """Copy all data files to snapshot directory"""
    files_copied = {}
    total_size = 0
    
    # Copy JSON files
    for file_path in DATA_DIR.rglob("*.json"):
        if file_path.is_file() and "snapshots" not in str(file_path):
            relative_path = file_path.relative_to(DATA_DIR)
            dest_path = snapshot_dir / relative_path
            
            # Create parent directories
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Copy file
            shutil.copy2(file_path, dest_path)
            
            file_size = file_path.stat().st_size
            files_copied[str(relative_path)] = {
                "size": file_size,
                "modified": datetime.fromtimestamp(file_path.stat().st_mtime, tz=timezone.utc).isoformat()
            }
            total_size += file_size
    
    # Copy JSONL files (search index, etc.)
    for file_path in DATA_DIR.rglob("*.jsonl"):
        if file_path.is_file() and "snapshots" not in str(file_path):
            relative_path = file_path.relative_to(DATA_DIR)
            dest_path = snapshot_dir / relative_path
            
            # Create parent directories
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Copy file
            shutil.copy2(file_path, dest_path)
            
            file_size = file_path.stat().st_size
            files_copied[str(relative_path)] = {
                "size": file_size,
                "modified": datetime.fromtimestamp(file_path.stat().st_mtime, tz=timezone.utc).isoformat()
            }
            total_size += file_size
    
    return {
        "files": files_copied,
        "total_files": len(files_copied),
        "total_size": total_size
    }

def create_snapshot_metadata(snapshot_dir: pathlib.Path, files_info: Dict[str, Any]) -> None:
    """Create snapshot metadata file"""
    metadata = {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "version": "1.0",
        "type": "data_snapshot",
        "stats": {
            "total_files": files_info["total_files"],
            "total_size": files_info["total_size"],
            "size_mb": round(files_info["total_size"] / (1024 * 1024), 2)
        },
        "files": files_info["files"]
    }
    
    metadata_path = snapshot_dir / "snapshot_metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

def cleanup_old_snapshots() -> List[str]:
    """Remove snapshots older than 7 days"""
    if not SNAPSHOTS_DIR.exists():
        return []
    
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=7)
    removed_snapshots = []
    
    for snapshot_path in SNAPSHOTS_DIR.iterdir():
        if snapshot_path.is_dir():
            try:
                # Parse date from directory name (YYYY-MM-DD format)
                date_str = snapshot_path.name
                snapshot_date = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                
                if snapshot_date < cutoff_date:
                    shutil.rmtree(snapshot_path)
                    removed_snapshots.append(date_str)
                    print(f"🗑️  Removed old snapshot: {date_str}")
                    
            except ValueError:
                # Skip directories that don't match date format
                print(f"⚠️  Skipping non-date directory: {snapshot_path.name}")
                continue
    
    return removed_snapshots

def list_available_snapshots() -> List[Dict[str, Any]]:
    """List all available snapshots"""
    if not SNAPSHOTS_DIR.exists():
        return []
    
    snapshots = []
    
    for snapshot_path in SNAPSHOTS_DIR.iterdir():
        if snapshot_path.is_dir():
            metadata_path = snapshot_path / "snapshot_metadata.json"
            
            if metadata_path.exists():
                try:
                    with open(metadata_path, "r", encoding="utf-8") as f:
                        metadata = json.load(f)
                    
                    snapshots.append({
                        "date": snapshot_path.name,
                        "created_at": metadata.get("created_at"),
                        "stats": metadata.get("stats", {}),
                        "path": str(snapshot_path)
                    })
                except Exception as e:
                    print(f"⚠️  Error reading snapshot metadata for {snapshot_path.name}: {e}")
    
    # Sort by date, newest first
    snapshots.sort(key=lambda x: x["date"], reverse=True)
    return snapshots

def restore_from_snapshot(snapshot_date: str) -> bool:
    """Restore data from a specific snapshot"""
    snapshot_dir = SNAPSHOTS_DIR / snapshot_date
    
    if not snapshot_dir.exists():
        print(f"❌ Snapshot not found: {snapshot_date}")
        return False
    
    metadata_path = snapshot_dir / "snapshot_metadata.json"
    if not metadata_path.exists():
        print(f"❌ Snapshot metadata not found: {snapshot_date}")
        return False
    
    try:
        # Load metadata
        with open(metadata_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)
        
        print(f"🔄 Restoring from snapshot: {snapshot_date}")
        print(f"   📊 Files: {metadata['stats']['total_files']}")
        print(f"   💾 Size: {metadata['stats']['size_mb']} MB")
        
        restored_files = 0
        
        # Restore each file
        for file_path, file_info in metadata["files"].items():
            source_path = snapshot_dir / file_path
            dest_path = DATA_DIR / file_path
            
            if source_path.exists():
                # Create parent directories
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Copy file
                shutil.copy2(source_path, dest_path)
                restored_files += 1
            else:
                print(f"⚠️  Snapshot file missing: {file_path}")
        
        print(f"✅ Restored {restored_files} files from snapshot {snapshot_date}")
        return True
        
    except Exception as e:
        print(f"❌ Error restoring snapshot {snapshot_date}: {e}")
        return False

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Create and manage data snapshots")
    parser.add_argument("--action", choices=["create", "list", "restore", "cleanup"], 
                       default="create", help="Action to perform")
    parser.add_argument("--date", help="Date for restore action (YYYY-MM-DD)")
    
    args = parser.parse_args()
    
    if args.action == "create":
        # Create new snapshot
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        snapshot_dir = create_snapshot_directory(date_str)
        
        print(f"📸 Creating snapshot: {date_str}")
        files_info = copy_data_files(snapshot_dir)
        create_snapshot_metadata(snapshot_dir, files_info)
        
        print(f"✅ Snapshot created successfully:")
        print(f"   📁 Location: {snapshot_dir}")
        print(f"   📊 Files: {files_info['total_files']}")
        print(f"   💾 Size: {round(files_info['total_size'] / (1024 * 1024), 2)} MB")
        
        # Cleanup old snapshots
        removed = cleanup_old_snapshots()
        if removed:
            print(f"🗑️  Cleaned up {len(removed)} old snapshots")
    
    elif args.action == "list":
        # List available snapshots
        snapshots = list_available_snapshots()
        
        if not snapshots:
            print("📭 No snapshots found")
            return
        
        print("📋 Available snapshots:")
        for snapshot in snapshots:
            stats = snapshot.get("stats", {})
            print(f"  📅 {snapshot['date']}")
            print(f"     📊 {stats.get('total_files', 0)} files, {stats.get('size_mb', 0)} MB")
            print(f"     🕐 Created: {snapshot.get('created_at', 'Unknown')}")
            print()
    
    elif args.action == "restore":
        # Restore from snapshot
        if not args.date:
            print("❌ --date required for restore action")
            return
        
        success = restore_from_snapshot(args.date)
        if not success:
            exit(1)
    
    elif args.action == "cleanup":
        # Cleanup old snapshots
        removed = cleanup_old_snapshots()
        print(f"🗑️  Cleaned up {len(removed)} old snapshots")

if __name__ == "__main__":
    main()