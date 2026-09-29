#!/usr/bin/env python3
"""
PLM AI - Source Code Packaging Script
Packages the full working application into a clean zip file for local offline execution.
"""
import os
import sys
import zipfile

def package_project(output_zip_path=None):
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    if not output_zip_path:
        output_zip_path = os.path.join(base_dir, 'public', 'downloads', 'plm-feedback-intelligence.zip')
    
    os.makedirs(os.path.dirname(output_zip_path), exist_ok=True)
    
    # Exclude directories that shouldn't be distributed or will be generated on npm install / build
    exclude_dirs = {
        'node_modules',
        '.git',
        'dist',
        '.cache',
        '.aistudio',
        '__pycache__',
        '.vite'
    }
    
    exclude_files = {
        '.DS_Store',
        'Thumbs.db',
        'package_project.pyc'
    }

    count = 0
    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files:
                    continue
                # Don't include the target zip file itself
                full_path = os.path.join(root, file)
                if os.path.abspath(full_path) == os.path.abspath(output_zip_path):
                    continue
                if file.endswith('.zip') and 'downloads' in root:
                    continue

                rel_path = os.path.relpath(full_path, base_dir)
                zipf.write(full_path, rel_path)
                count += 1

    size_bytes = os.path.getsize(output_zip_path)
    size_kb = size_bytes / 1024
    print(f"Packaged {count} files into {output_zip_path} ({size_kb:.1f} KB)")
    return output_zip_path

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else None
    package_project(target)
