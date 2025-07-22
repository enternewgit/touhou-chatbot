from http.server import BaseHTTPRequestHandler
import json
import os
import google.generativeai as genai

# 環境変数からAPIキーを取得
API_KEY = os.getenv("GEMINI_API_KEY")
DEMO_MODE = not API_KEY

if API_KEY:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # リクエストボディを読み込み
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        user_message = data.get('message', '')
        character_id = data.get('character_id', 'reimu')
        
        if DEMO_MODE:
            # デモモード
            demo_responses = {
                'reimu': 'あら、こんにちはね。今日も神社は平和よ。',
                'marisa': 'よう！何か面白いことでもあるのか？',
                'sakuya': 'いらっしゃいませ。何かご用でしょうか？',
                'yuyuko': 'あら〜、いらっしゃい♪'
            }
            ai_message = demo_responses.get(character_id, demo_responses['reimu'])
            ai_message += "\n\n（※これはデモモードです。環境変数GEMINI_API_KEYを設定すると、AIが本格的に応答します）"
        else:
            # 通常モード（今は簡易版）
            ai_message = f"こんにちは！{user_message}ですね。"
        
        response = {
            "reply": ai_message,
            "character": {"id": character_id, "name": "テストキャラ"}
        }
        
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
