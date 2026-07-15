import urllib.request
import json
import re
import ssl
import os
import sys

def get_existing_data():
    """Load existing data from instagram.json if it exists."""
    filepath = 'instagram.json'
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not read existing instagram.json: {e}")
    return []

def scrape_instagram_via_viewer(username):
    """
    Attempts to scrape recent posts from public viewers.
    Returns a list of posts or None if all scrape attempts fail.
    """
    # Since Instagram is very strict, we try multiple public mirror viewers.
    # We will try Tikvib (which Picuki redirects to) since it worked previously,
    # and look for image links and descriptions.
    
    viewers = [
        {
            "name": "Tikvib (Picuki Redirect)",
            "url": f"https://www.tikvib.com/profile/{username}",
            "img_pattern": r'<img src="([^"]+)" alt="([^"]+)"',
            "link_pattern": r'href="(/media/[^"]+)"'
        }
    ]
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    for viewer in viewers:
        print(f"Attempting to scrape via {viewer['name']}...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7'
        }
        
        try:
            req = urllib.request.Request(viewer['url'], headers=headers)
            with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
                if response.status == 200:
                    html = response.read().decode('utf-8')
                    print(f"Successfully fetched HTML from {viewer['name']}. Length: {len(html)}")
                    
                    # Extract image and alt tag (caption)
                    # We look for image tags containing alt texts which usually hold the captions
                    img_matches = re.findall(viewer['img_pattern'], html)
                    link_matches = re.findall(viewer['link_pattern'], html)
                    
                    if not img_matches:
                        print(f"No image/caption matches found on {viewer['name']}.")
                        continue
                        
                    posts = []
                    # First img is usually profile picture, so we skip it or filter by alt/url
                    for i, (src, alt) in enumerate(img_matches):
                        # Filter profile images or empty descriptions if needed, but let's take valid post images
                        if 'profile-image' in html and i == 0:
                            continue # skip profile pic
                            
                        # Clean up alt text (unescape html entities if any)
                        caption = alt.replace('&quot;', '"').replace('&amp;', '&').strip()
                        
                        # Generate post link
                        post_link = f"https://www.instagram.com/{username}/"
                        if i-1 < len(link_matches):
                            media_path = link_matches[i-1]
                            # If it's a TikTok viewer, link to tiktok or keep ig link
                            if 'tikvib' in viewer['url']:
                                # Convert media id to a link or just link to profile
                                post_link = f"https://www.tiktok.com/@{username}/video/{media_path.split('/')[-1]}"
                            else:
                                post_link = f"https://www.instagram.com/p/{media_path.split('/')[-1]}/"
                        
                        posts.append({
                            "image": src,
                            "caption": caption,
                            "date": "Reciente",  # Viewers don't always have clean dates, we can write 'Reciente'
                            "link": post_link
                        })
                    
                    if posts:
                        print(f"Successfully scraped {len(posts)} posts from {viewer['name']}.")
                        return posts[:6] # Return latest 6 posts
                else:
                    print(f"HTTP Status {response.status} from {viewer['name']}.")
        except Exception as e:
            print(f"Error scraping via {viewer['name']}: {e}")
            
    return None

def main():
    username = "celiaserpi"
    
    # 1. Load existing data in case we need to fall back
    existing_posts = get_existing_data()
    print(f"Loaded {len(existing_posts)} existing posts from instagram.json.")
    
    # 2. Try scraping new data
    new_posts = scrape_instagram_via_viewer(username)
    
    if new_posts:
        # Save new scraped posts
        try:
            with open('instagram.json', 'w', encoding='utf-8') as f:
                json.dump(new_posts, f, ensure_ascii=False, indent=4)
            print("Successfully updated instagram.json with new scraped data.")
        except Exception as e:
            print(f"Error writing new data to file: {e}")
            sys.exit(1)
    else:
        # Fallback to existing data or default template
        print("Scraping was unsuccessful or blocked. Retaining existing instagram.json to prevent site breakage.")
        if not existing_posts:
            # If the file doesn't even exist, write a basic placeholder so JS doesn't break
            print("No existing instagram.json found. Creating default placeholder data.")
            default_posts = [
                {
                    "image": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
                    "caption": "📚 Recomendación: El Imperio del Vampiro. Excelente lectura. #libros #fantasía",
                    "date": "2026-07-10",
                    "link": f"https://www.instagram.com/{username}/"
                }
            ]
            try:
                with open('instagram.json', 'w', encoding='utf-8') as f:
                    json.dump(default_posts, f, ensure_ascii=False, indent=4)
                print("Created default placeholder in instagram.json.")
            except Exception as e:
                print(f"Error writing default data to file: {e}")
                sys.exit(1)

if __name__ == "__main__":
    main()
