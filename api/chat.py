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
    def do_GET(self):
        # GETでのテスト用レスポンス
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "message": "チャットAPIが動作しています。POSTでメッセージを送信してください。",
            "demo_mode": DEMO_MODE,
            "api_key_configured": bool(API_KEY)
        }
        
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

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
            # 本格的なAI応答
            try:
                # キャラクター情報
                character_prompts = {
                    'reimu': "あなたは博麗霊夢です。楽園の巫女として、のんびりとした口調で話してください。少し面倒くさがりですが、実は責任感が強い性格です。",
                    'marisa': "あなたは霧雨魔理沙です。普通の魔法使いとして、元気で明るい口調で話してください。好奇心旺盛で努力家です。",
                    'sakuya': "あなたは十六夜咲夜です。紅魔館のメイド長として、丁寧で上品な口調で話してください。完璧主義者で時間に厳格です。",
                    'yuyuko': "あなたは西行寺幽々子です。白玉楼の主として、おっとりとした優雅な口調で話してください。天然で食いしん坊な性格です。"
                }
                
                character_prompt = character_prompts.get(character_id, character_prompts['reimu'])
                
                # AIに送信するプロンプト
                full_prompt = f"{character_prompt}\n\nユーザー: {user_message}\n\nキャラクターとして自然に応答してください。"
                
                response = model.generate_content(full_prompt)
                ai_message = response.text
                
            except Exception as e:
                print(f"AI応答エラー: {e}")
                ai_message = "すみません、今少し調子が悪いようです...また後で話しかけてくださいね。"
        
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
