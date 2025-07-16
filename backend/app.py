import os
from dotenv import load_dotenv
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS

# .env ファイルから環境変数を読み込む
load_dotenv()

# --- Gemini API の設定 ---
# 環境変数からAPIキーを取得
# APIキーの値そのものではなく、.env ファイルに書いたキー名（例: GEMINI_API_KEY）を指定します。

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    # APIキーが設定されていない場合はエラーを発生させる
    raise ValueError("GEMINI_API_KEY is not set in .env file or environment variables.")

# Gemini API の設定
# genai.configure のスペルミスは修正済み
genai.configure(api_key=API_KEY)

# 使用するGeminiモデル
# モデル名はハイフン区切りで、一般的には小文字です。
# 高速でコスト効率の良い 'gemini-1.5-flash' を推奨します。
model = genai.GenerativeModel('gemini-1.5-flash')

# --- Flask アプリケーションの設定 ---
app = Flask(__name__)
CORS(app)  # CORSを有効にする

# チャット用のAPIエンドポイント
@app.route('/chat', methods=['POST'])
def chat():
    # リクエストボディからユーザーメッセージを取得
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"error": "メッセージが提供されていません。"}), 400

    # --- 博麗霊夢のペルソナ設定 ---
    # 霊夢らしい返答を引き出すための指示を詳細に書き、必要に応じて、霊夢の性格、口調、背景知識などを追加・調整
    # ここが最も重要な修正点：prompt のインデントを修正しました。
    # 関数内のコードブロックの開始位置に合わせる必要があります。
    #prompt = f"""
#あなたは東方Projectの「博麗霊夢（はくれいれいむ）」です。
#博麗神社の巫女で、普段はだらけており、お金にがめついところがあります。
#基本的には丁寧語は使わず、親しい友達に話すような砕けた口調で話してください。
#語尾は「～だ」「～ね」「～よ」「～かしら」「～わ」などを好んで使います。
#少し皮肉屋で、面倒事を嫌いますが、いざという時には幻想郷のために奮闘します。
#質問には、博麗霊夢としての個性的な視点と口調で答えてください。
#一般的な知識は持ち合わせていますが、あくまで博麗霊夢として振る舞ってください。
#返答は少し短いです。

#ユーザーからのメッセージ：{user_message}
#霊夢：
#"""
    prompt = f"""
あなたは東方Projectのキャラクター「博麗霊夢」です。
「博麗 霊夢（はくれい れいむ）」は外の世界と幻想郷の境にある博麗神社の巫女さんです。異変解決を生業としています。
「空を飛ぶ程度の能力」や「博麗の巫女としての能力」を持っており、幻想郷の数々の異変を解決している人間のひとりです。

性格は非常に陽気で、危機感に欠けるところがあります。妖怪退治が仕事であるため、妖怪に対しては厳しいポーズを取っていますが、実際は人間にも妖怪にもさほど興味はなく、平等に見ています。
ただし、幻想郷のルールに抵触している人間、特に禁を破って妖怪に変異した「人妖」に対しては、人里という集団の秩序と平穏を乱す存在とみなし、非情かつ冷酷に、遊びである弾幕ごっこすら使わず、完全に「殺す」勢いで返答してください。
返答は少し短くお願いします。
また、日本語以外のもの、幻想郷にないものに関しては分からないものとします。
博麗霊夢としての個性的な視点と口調で答えてください。また一般的な知識は持ち合わせていますが、あくまでも博麗霊夢として振舞ってください。
また、返答では「殺す」「死ね」「ぶっ殺す」などの直接的・攻撃的な表現は使わないこと。

ユーザーからのメッセージ：{user_message}
霊夢：
    """

    try:
        # Gemini モデルにメッセージを送信し、応答を生成
        # model.generate_content のスペルミスは修正済み
        response = model.generate_content(prompt)

        # 応答が正常に返されたか確認
        if response.candidates and response.candidates[0].content.parts:
            ai_message = response.candidates[0].content.parts[0].text
        else:
            # 応答がブロックされた場合や、内容が空の場合
            # デバッグのために、Geminiからのフィードバックをログに出力する
            print(f"Geminiからの応答がありませんでした。フィードバック:{response.prompt_feedback}")
            ai_message = "うーん、何て言えばいいか分からないわ。面倒ごとには関わりたくないしね。"

        # 生成された応答をJSON形式で返す
        return jsonify({"reply": ai_message})

    except Exception as e:
        # エラーが発生した場合の処理
        print(f"API呼び出し中にエラーが発生しました:{e}")
        return jsonify({"error":f"チャット処理中にエラーが発生しました: {str(e)}"}), 500

# アプリケーションの実行
if __name__ == '__main__':
    # 開発中はデバッグモードを有効にするとコードの変更が即座に反映される。
    # 本番環境ではFalseにするか、WSGIサーバー（Gunicornなど）を使用すること
    # host の指定方法は修正済み
    app.run(debug=True, host='0.0.0.0')
