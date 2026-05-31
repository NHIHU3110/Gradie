import os
import re

root_dir = '/Users/huynhthaonhi/Downloads/Gradie/gradie-website'
html_dir = os.path.join(root_dir, 'html')

if not os.path.exists(html_dir):
    os.makedirs(html_dir)

# Find all HTML files in the root dir
html_files = [f for f in os.listdir(root_dir) if f.endswith('.html')]

print(f"Syncing {len(html_files)} HTML files from root to html/ folder...")

for filename in html_files:
    root_path = os.path.join(root_dir, filename)
    dest_path = os.path.join(html_dir, filename)
    
    with open(root_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace resource paths to point one level up
    # Match href="css/..., href="css/..., src="js/..., src="images/...
    modified = re.sub(r'href=["\']css/', 'href="../css/', content)
    modified = re.sub(r'src=["\']js/', 'src="../js/', modified)
    modified = re.sub(r'src=["\']images/', 'src="../images/', modified)
    
    # Write to html/ folder
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(modified)
        
print("Sync complete successfully!")
