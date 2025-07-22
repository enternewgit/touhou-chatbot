from http.server import BaseHTTPRequestHandler
import json

# 静的なキャラクター定義（高速化のため）
CHARACTERS = {
    "reimu": {"name": "博麗霊夢", "full_name": "博麗 霊夢（はくれい れいむ）", "description": "博麗神社の巫女", "avatar": "/avatars/reimu.png"},
    "marisa": {"name": "霧雨魔理沙", "full_name": "霧雨 魔理沙（きりさめ まりさ）", "description": "普通の魔法使い", "avatar": "/avatars/marisa.png"},
    "sakuya": {"name": "十六夜咲夜", "full_name": "十六夜 咲夜（いざよい さくや）", "description": "紅魔館のメイド長", "avatar": "/avatars/sakuya.png"},
    "yuyuko": {"name": "西行寺幽々子", "full_name": "西行寺 幽々子（さいぎょうじ ゆゆこ）", "description": "白玉楼の亡霊", "avatar": "/avatars/yuyuko.png"}
}

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'max-age=3600')  # 1時間キャッシュ
        self.end_headers()
        
        # 高速化：事前に構築されたレスポンス
        character_list = [
            {"id": char_id, **char_data}
            for char_id, char_data in CHARACTERS.items()
        ]
        
        response = {"characters": character_list}
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
