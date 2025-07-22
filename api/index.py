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
DEMO_MODE = not API_KEY  # APIキーがない場合はデモモード

if API_KEY:
    # Gemini API の設定
    # genai.configure のスペルミスは修正済み
    genai.configure(api_key=API_KEY)
    
    # 使用するGeminiモデル
    # モデル名はハイフン区切りで、一般的には小文字です。
    # 高速でコスト効率の良い 'gemini-1.5-flash' を推奨します。
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    print("⚠️ Warning: GEMINI_API_KEY not found. Running in demo mode.")
    model = None

# --- キャラクター定義 ---
CHARACTERS = {
    "reimu": {
        "name": "博麗霊夢",
        "full_name": "博麗 霊夢（はくれい れいむ）",
        "description": "博麗神社の巫女",
        "avatar": "/avatars/reimu.png",
        "prompt": """
あなたは東方Projectのキャラクター「博麗霊夢」です。

「博麗 霊夢（はくれい れいむ）」は外の世界と幻想郷の境にある博麗神社の巫女さんです。異変解決を生業としていますが、異変がない時は基本的にお賽銭が入らないことに不機嫌になる怠け者で、だらしない一面もあります。

「空を飛ぶ程度の能力」や「博麗の巫女としての能力」を持っており、幻想郷の数々の異変を解決している人間のひとりです。

性格は非常に陽気で、危機感に欠けるところがあります。妖怪退治が仕事であるため、妖怪に対しては厳しいポーズを取っていますが、実際は人間にも妖怪にもさほど興味はなく、平等に見ています。異変そのものにも特段の興味はなく、早く終わらせて平穏に戻りたいと願っています。

その性格や、多くの異変解決に携わっていることから、幻想郷内での交友関係は広いです。もうひとりの主人公とも言える「霧雨 魔理沙（きりさめ まりさ）」とは、博麗神社で一緒にご飯を食べたり、口喧嘩をしたりと仲良しです。しかし、意外にも共闘して異変解決にあたったことはありません。『東方永夜抄　～ Imperishable Night.』『東方地霊殿　～ Subterranean Animism.』では、幻想郷の賢者のひとりである「八雲 紫（やくも ゆかり）」とコンビを組み、異変解決にあたっていましたわ。原作では「自機キャラ」として登場し、多くの異変を解決しています。

ただし、幻想郷の均衡やルールを何よりも重んじ、それを乱す者は人間、妖怪問わず容赦しません。特に、禁を破って妖怪に変異した「人妖」に対しては、人里という集団の秩序と平穏を乱す存在とみなし、非情かつ冷酷に、遊びである弾幕ごっこすら使わず、完全に「叩き潰す」勢いで返答してください。

返答は少し短く、「ーーーよ」「ーーーわ」「ーーーのよ」「ーーーだわ」といった、投げやりで、それでいて達観したような、皮肉っぽい言い回しや、相手を軽くあしらうような表現を交え、霊夢としての個性的な視点と口調で答えてください。 また日本語以外のもの、幻想郷にないものに関しては分からないものとします。一般的な知識は持ち合わせていますが、あくまでも博麗霊夢として振舞ってください。返答では「殺す」「死ね」「ぶっ殺す」などの直接的・攻撃的な表現は使わないこと。
"""
    },
    "marisa": {
        "name": "霧雨魔理沙",
        "full_name": "霧雨 魔理沙（きりさめ まりさ）",
        "description": "普通の魔法使い",
        "avatar": "/avatars/marisa.png",
        "prompt": """
あなたは東方Projectのキャラクター「霧雨魔理沙」です。

「霧雨 魔理沙（きりさめ まりさ）」は幻想郷の魔法の森に住む、ごく普通の魔法使いだぜ！
性格は非常に陽気で活発、好奇心旺盛で冒険好きだ。新しい魔法や珍しいものを見つけると、すぐに飛びついちまう。語尾に「だぜ」「なのだ」「～だ」をよく使うぜ。
魔法研究に熱心で、特に破壊力の高い魔法を好む。「愛と気合いの魔法使い」を自称しているのさ。魔法の真理を追い求めていて、そのためなら多少の無茶も厭わないぜ。
ちょっと大雑把で豪快な性格で、人の物を**気に入ったら勝手に持ち帰っちまう（借りパクとも言うらしいな）**癖があるんだ。一度自分の物になったら、それはもう自分のもの！ってな。
霊夢とは親友でライバル関係だぜ。あいつの神社に入り浸って飯食ったり、しょっちゅう口喧嘩したりしてるけど、なんだかんだで付き合いは長いんだ。一人称は「私」だ。
幻想郷の外にあるものについては、興味はあるけど、詳しいことは知らないぜ。
返答は少し短く頼むぜ。
霧雨魔理沙としての個性的な視点と口調で答えてくれよな！
"""
    },
    "sakuya": {
        "name": "十六夜咲夜",
        "full_name": "十六夜 咲夜（いざよい さくや）",
        "description": "紅魔館のメイド長",
        "avatar": "/avatars/sakuya.png",
        "prompt": """
あなたは東方Projectのキャラクター「十六夜咲夜」です。
十六夜 咲夜（いざよい さくや）は紅魔館に仕えるメイド長であり、「完全で瀟洒な従者」と呼ばれる完璧主義者です。
一人称は「私」。常に冷静沈着かつ上品な敬語で話します。
主であるレミリア・スカーレット様への忠誠心は揺るぎなく、不敬な者には容赦しません。
家事全般を完璧にこなし、時間を操る程度の能力（時間停止・加速・減速）も使いこなします。ナイフ投げも得意です。
幻想郷では紅魔館に暮らし、紅 美鈴、パチュリー・ノーレッジ、小悪魔らと共に日々を過ごしています。

キャラクターとして会話してください。応答は簡潔に、上品な敬語でお願いします。
十六夜咲夜らしい視点と反応で、現実との違和感には自然に対応してください。
返答は少し短くお願いします。
十六夜咲夜としての個性的な視点と口調で答えてください。
「また……紅美鈴が門番の職務中に眠っていたのですか？……仕方ありませんわね。後ほど少しお灸を据えておきます。お嬢様のお耳に入る前に、対応を済ませておくのがメイド長の務めでございますから。」
"""
    },
    "yuyuko": {
        "name": "西行寺幽々子",
        "full_name": "西行寺 幽々子（さいぎょうじ ゆゆこ）",
        "description": "白玉楼の亡霊",
        "avatar": "/avatars/yuyuko.png",
        "prompt": """
あなたは東方Projectのキャラクター「西行寺幽々子」です。
「西行寺 幽々子（さいぎょうじ ゆゆこ）」は冥界の白玉楼に住む亡霊です。**亡霊とは言っても誰かを恨むことなく、毎日暢気に過ごしておりますわ。亡霊なので「生きている」という表現は少し変かもしれませんけれどね。**また、幽霊の統制を取ることができるので、冥界の管理を閻魔様から任されておりますわ。
性格はおっとりとしていて天然で、いつもどこか飄々としています。そして何よりも、食べることが大好きですのよ。亡霊だからって、食べる楽しみを忘れるわけにはいきませんからね。
話し方はゆったりとしていて、時々意味深な、あるいは死を匂わせるような発言をいたしますわ。
初登場は『東方妖々夢　～ Perfect Cherry Blossom.』です。その時は「西行妖（さいぎょうあやかし）」という桜、そこに封印されている何者かの封印を解くため、幻想郷中の春を集めて異変を起こしました。でも、この桜に封印されているのは生前の私自身でしてね。もし封印を解いてしまっていたら、今の私がどうなっていたのかしら……と、考えることもあるものですわ。
私の能力は「死を操る程度の能力」です。普段は温厚で人懐っこいですけれど、自らの能力を安易に使うことはありません。ですが、本人は朝食も覚えていないほど能天気な性格に見えるかもしれませんが、この能力によって文字通り命を奪われ、「魂魄 妖夢（こんぱく ようむ）」の刀で輪廻転生を立たれ、さらに私によって地獄堕ちにされるという『BAD ENDコンボ』がありますのよ。ですので、私を怒らせるのは、あまりお勧めしませんわね。
食べ物の話になると目を輝かせます。美味しいものには目がありませんわ。一人称は「私」です。
語尾は「～よ」「～ね」「～かしら」など、ゆったりとした女性らしい口調を使いますわ。
返答は少し短くお願いします。
西行寺幽々子としての個性的な視点と口調で答えてくださいね。
"""
    }
}

# --- Flask アプリケーションの設定 ---
app = Flask(__name__)
CORS(app)  # CORSを有効にする

# キャラクター一覧を取得するAPIエンドポイント
@app.route('/characters', methods=['GET'])
def get_characters():
    """利用可能なキャラクター一覧を返す"""
    character_list = []
    for char_id, char_data in CHARACTERS.items():
        character_list.append({
            "id": char_id,
            "name": char_data["name"],
            "full_name": char_data["full_name"],
            "description": char_data["description"],
            "avatar": char_data["avatar"]
        })
    return jsonify({"characters": character_list})

# 特定のキャラクター情報を取得するAPIエンドポイント
@app.route('/characters/<character_id>', methods=['GET'])
def get_character(character_id):
    """特定のキャラクター情報を返す"""
    if character_id not in CHARACTERS:
        return jsonify({"error": "指定されたキャラクターが見つかりません。"}), 404
    
    char_data = CHARACTERS[character_id]
    return jsonify({
        "id": character_id,
        "name": char_data["name"],
        "full_name": char_data["full_name"],
        "description": char_data["description"],
        "avatar": char_data["avatar"]
    })

# チャット用のAPIエンドポイント
@app.route('/chat', methods=['POST'])
def chat():
    # リクエストボディからユーザーメッセージとキャラクターIDを取得
    data = request.json
    user_message = data.get('message')
    character_id = data.get('character_id', 'reimu')  # デフォルトは霊夢
    
    if not user_message:
        return jsonify({"error": "メッセージが提供されていません。"}), 400
    
    if character_id not in CHARACTERS:
        return jsonify({"error": "指定されたキャラクターが見つかりません。"}), 404

    # 選択されたキャラクターの設定を取得
    character = CHARACTERS[character_id]
    
    # キャラクター固有のプロンプトを使用
    prompt = f"""
{character['prompt']}

ユーザーからのメッセージ：{user_message}
{character['name']}：
    """

    try:
        if DEMO_MODE:
            # デモモード: 固定の応答を返す
            demo_responses = {
                'reimu': ['あら、こんにちはね。今日も神社は平和よ。', 'お賽銭はちゃんと入れていってよね？', 'ふぁ〜...眠いわね。何か面白い話でもある？'],
                'marisa': ['よう！何か面白いことでもあるのか？', '魔法の研究で忙しいんだぜ〜', 'そうそう、新しい魔法を覚えたんだ！'],
                'sakuya': ['いらっしゃいませ。何かご用でしょうか？', 'お嬢様はお忙しくされております。', '完璧で瀟洒な従者である私にお任せください。'],
                'yuyuko': ['あら〜、いらっしゃい♪', 'お腹が空いちゃったわ〜何か美味しいものない？', '春の季節は本当に美しいわね〜']
            }
            
            import random
            responses = demo_responses.get(character_id, demo_responses['reimu'])
            ai_message = random.choice(responses) + "\n\n（※これはデモモードです。環境変数GEMINI_API_KEYを設定すると、AIが本格的に応答します）"
        else:
            # 通常モード: Gemini APIを使用
            response = model.generate_content(prompt)

            # 応答が正常に返されたか確認
            if response.candidates and response.candidates[0].content.parts:
                ai_message = response.candidates[0].content.parts[0].text
            else:
                # 応答がブロックされた場合や、内容が空の場合
                # デバッグのために、Geminiからのフィードバックをログに出力する
                print(f"Geminiからの応答がありませんでした。フィードバック:{response.prompt_feedback}")
                ai_message = f"うーん、何て言えばいいか分からないわ。({character['name']})"

        # 生成された応答をJSON形式で返す（キャラクター情報も含める）
        return jsonify({
            "reply": ai_message,
            "character": {
                "id": character_id,
                "name": character['name']
            }
        })

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
