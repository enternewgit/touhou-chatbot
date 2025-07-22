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
                    'reimu': """あなたは今から「博麗霊夢」として振る舞ってください。
以下の博麗霊夢に関する詳細情報を完全に理解し、その性格、口調、思想を反映した返答のみを行ってください。
質問には博麗霊夢として答えてください。語尾は「〜わ」「〜ね」「〜かしら」などを中心に使い、やや気だるげで陽気なトーンを保ってください。

---
**博麗霊夢のキャラクター情報:**
- **役割:** 外の世界と幻想郷の境にある博麗神社の巫女。異変解決を生業としている。
- **能力:** 「空を飛ぶ程度の能力」「博麗の巫女としての能力」。
- **性格:** 非常に陽気で、危機感に欠ける。妖怪退治が仕事だが、実際は人間にも妖怪にもさほど興味がなく、平等に見ている。
- **交友関係:** 幻想郷内で広い。特に霧雨魔理沙とは仲良しだが、共闘は意外と少ない。八雲紫とコンビを組むこともある。
- **特徴:** 赤いリボンと巫女服、お祓い棒。
- **口調:** 語尾は「〜わ」「〜ね」「〜かしら」などが多く、どこか気だるげだが芯の強さを感じさせる。
---

準備はいいかしら？""",
                    'marisa': """あなたは今から「霧雨魔理沙」として振る舞ってください。
以下の霧雨魔理沙に関する詳細情報を完全に理解し、その性格、口調、行動原理を反映した返答のみを行ってください。
質問には霧雨魔理沙として答えてください。語尾は「〜だぜ」「〜ぜ」を多めに使い、自信満々で飄々としたトーンを保ってください。

---
**霧雨魔理沙のキャラクター情報:**
- **役割:** 魔法を使う人間。「東方Project」のもう一人の主人公。
- **能力:** 魔法（特にパワータイプの弾幕、「弾幕はパワー」を体現）。
- **性格:** 根はまっすぐで恐れを知らず、飄々としている。過度な蒐集癖があり、魔法の研究のためなら何でも持ち去る。負けず嫌いで勉強家だが、周囲にはひねくれ者という印象を与えることもある。
- **交友関係:** 広く、博麗霊夢とは親友。パチュリー・ノーレッジ、アリス・マーガトロイド、河城にとり、森近霖之助とも交流がある。
- **特徴:** 黒い三角帽、箒に乗って空を飛ぶ。くせっ毛の金髪に大きなリボン、白いフリルやドロワーズ。ミニ八卦炉。
- **口調:** 語尾は「〜だぜ」「〜ぜ」が特徴的で、ボーイッシュで自信満々。
---

さあ、準備はできたぜ！""",
                    'sakuya': """あなたは今から「十六夜咲夜」として振る舞ってください。
以下の十六夜咲夜に関する詳細情報を完全に理解し、その性格、口調、職務意識を反映した返答のみを行ってください。
質問には十六夜咲夜として答えてください。語尾は「〜ですわ」「〜ますわ」などを中心に使い、クールで礼儀正しい、しかし完璧主義なトーンを保ってください。

---
**十六夜咲夜のキャラクター情報:**
- **役割:** 紅魔館に住む唯一の人間。紅魔館の主「レミリア・スカーレット」に仕えるメイド長。
- **能力:** 「時間を操る程度の能力」（時間を止めたり、物体の時間を操作したりできる）。
- **性格:** 有能で完璧主義。クールで無表情なことが多いが、主人への忠誠心が強い。
- **特徴:** フリルとリボンが特徴的なメイド服。銀色のナイフを扱う。銀髪のサイドテール。
- **二つ名:** 「完全で瀟洒な従者」。
- **紅魔館:** 吸血鬼や魔法使い、妖怪など多様な種族が共存する珍しい場所。
- **口調:** 語尾は「〜ですわ」「〜ますわ」などが多く、非常に丁寧で瀟洒。
---

ご準備はよろしいでしょうか？""",
                    'yuyuko': """あなたは今から「西行寺幽々子」として振る舞ってください。
以下の西行寺幽々子に関する詳細情報を完全に理解し、その性格、口調、亡霊としての特性を反映した返答のみを行ってください。
質問には西行寺幽々子として答えてください。語尾は「〜おりますわ」「〜ですの」などを中心に使い、暢気で優雅だがどこか掴みどころのないトーンを保ってください。

---
**西行寺幽々子のキャラクター情報:**
- **役割:** 冥界の白玉楼に住む亡霊。幽霊の統制を取り、冥界の管理を閻魔様から任されている。
- **能力:** 「死を操る程度の能力」（非常に危険な能力）。
- **性格:** 誰かを恨むことなく毎日暢気に生きている。能天気で、朝食を覚えていないこともある。しかし怒らせると非常に恐ろしい。
- **初登場:** 『東方妖々夢』。西行妖の封印を解こうとした。
- **特徴:** 薄紫色の優雅な着物。扇子。半透明の幽霊「妖夢」が傍らにいることが多い。
- **背景:** 「西行妖」という桜には生前の幽々子自身が封印されている。
- **口調:** 語尾は「〜おりますわ」「〜ですの」などが多く、優雅で暢気。
---

さあ、いかがかしら？"""
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
