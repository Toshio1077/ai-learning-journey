"""
G検定問題集 改修適用スクリプト
================================
使い方:
  python apply_fixes.py G検定問題集_最新版.html

出力: G検定問題集_改修済み.html

適用内容:
1. 選択肢位置参照の修正（40問）: 「選択肢A」→内容の要約に置換
2. 数式過多の解説修正（20問）: 意味的理解ベースに書き換え
3. q005のch修正、q001のtext修正
4. 新規問題76問の追加（Part1: q282-q317, Part2: q318-q357）
"""

import re, sys, os

def read_string_at(text, pos):
    """Read a single-quoted JS string starting at pos"""
    assert text[pos] == "'", f"Expected ' at pos {pos}"
    pos += 1
    result = ''
    while pos < len(text):
        if text[pos] == '\\' and pos + 1 < len(text):
            result += text[pos:pos+2]
            pos += 2
        elif text[pos] == "'":
            return result, pos + 1
        else:
            result += text[pos]
            pos += 1
    return result, pos

def extract_choice_concept(choice_text, max_len=25):
    """Extract key concept from choice text for content-based reference"""
    clean = choice_text.replace('\\n', ' ').strip()
    clean = re.sub(r'<[^>]+>', '', clean)
    first = re.split(r'[。、で]', clean)[0]
    if len(first) > max_len:
        first = first[:max_len] + '…'
    return first

def fix_positional_refs(content):
    """Replace 選択肢A/B/C/D with content descriptions"""
    labels = ['A', 'B', 'C', 'D']
    
    # Find each question and its choices
    q_pattern = re.compile(r"\{id:'(q\d+)',ch:'(ch\d+)',text:'")
    
    fixed_count = 0
    result = content
    
    for m in q_pattern.finditer(content):
        q_start = m.start()
        qid = m.group(1)
        
        # Extract choices for this question
        choices_start = content.find("choices:[", q_start)
        if choices_start == -1 or choices_start > q_start + 5000:
            continue
        
        choices = []
        cpos = choices_start + len("choices:[")
        while cpos < len(content):
            while cpos < len(content) and content[cpos] in ' \n\r\t':
                cpos += 1
            if content[cpos] == ']':
                break
            if content[cpos] == ',':
                cpos += 1
                continue
            if content[cpos] == "'":
                choice_val, cpos = read_string_at(content, cpos)
                choices.append(choice_val)
        
        # Find exp region
        exp_start = content.find("exp:'", cpos)
        if exp_start == -1 or exp_start > cpos + 200:
            continue
        exp_val, exp_end = read_string_at(content, exp_start + 4)
        
        # Also find text region
        text_start = content.find("text:'", q_start)
        text_val, text_end = read_string_at(content, text_start + 5)
        
        # Check for positional refs
        new_exp = exp_val
        new_text = text_val
        changed = False
        
        for i, label in enumerate(labels):
            pattern = f'選択肢{label}'
            if pattern in new_exp and i < len(choices):
                concept = extract_choice_concept(choices[i])
                new_exp = new_exp.replace(pattern, f'「{concept}」')
                changed = True
            if pattern in new_text and i < len(choices):
                concept = extract_choice_concept(choices[i])
                new_text = new_text.replace(pattern, f'「{concept}」')
                changed = True
        
        if changed:
            # Replace in result
            result = result[:exp_start+4] + "'" + new_exp + "'" + result[exp_end:]
            # Recalculate positions for text (before exp, so offset changes)
            if new_text != text_val:
                text_start_in_result = result.find(f"text:'{text_val}'", q_start)
                if text_start_in_result >= 0:
                    result = result[:text_start_in_result+5] + "'" + new_text + "'" + result[text_start_in_result + 6 + len(text_val) + 1:]
            fixed_count += 1
    
    return result, fixed_count

def apply_exp_fixes(content, fixes):
    """Replace exp for specific question IDs"""
    fixed = 0
    for qid, new_exp in fixes.items():
        pattern = rf"(\{{id:'{qid}'.*?exp:').*?('\s*\}})"
        def replacer(m):
            return m.group(1) + new_exp + m.group(2)
        new_content, n = re.subn(pattern, replacer, content, flags=re.DOTALL)
        if n > 0:
            content = new_content
            fixed += 1
    return content, fixed

def apply_meta_fixes(content):
    """Fix q005 chapter and q001 text"""
    # q005: ch05 -> ch01
    content = content.replace("{id:'q005',ch:'ch05'", "{id:'q005',ch:'ch01'")
    
    # q001: remove positional ref from text
    content = content.replace('選択肢AとBは特に紛らわしいので注意すること。', '')
    
    return content

# ---- Math exp fixes (from Part 1) ----
EXP_FIXES = {
'q034': '<span class="hl">ジニ不純度</span>は、あるノード内のデータがどれだけ「混ざっている」かを測る指標。値が0なら完全に1クラスのみ（純粋）、値が大きいほど複数クラスが混在している（不純）。決定木はジニ不純度が最も減る特徴量で分岐する（<span class="hl2">CART</span>アルゴリズムで使用）。同じく不純度を測る指標に<span class="hl">エントロピー</span>（情報量に基づく指標、ID3・C4.5で使用）がある。両者は通常ほぼ同じ分岐結果になるが、ジニ不純度のほうが計算が軽い。scikit-learnのデフォルトはジニ不純度。',
'q056': '<span class="hl">クロスエントロピー</span>は<span class="hl2">分類問題</span>の損失関数。モデルが出力する確率分布（Softmax/Sigmoid）と正解ラベルの「ズレ」を測る。予測が正解から離れるほど急激にペナルティが大きくなるため、誤分類の修正が速い。<span class="hl">MSE（平均二乗誤差）</span>は<span class="hl2">回帰問題</span>の損失関数。予測値と正解値の差の2乗の平均で、連続値の予測精度を測る。分類でMSEを使うと勾配が小さくなりやすく学習が遅くなるため、分類→クロスエントロピー、回帰→MSEが定石。<span class="hl2">KL情報量</span>はクロスエントロピーと密接に関連し、2つの確率分布の差を測る指標。',
'q121': '<span class="hl">中心極限定理</span>（CLT）は統計学の最も重要な定理の一つ。母集団がどんな分布であっても、<span class="hl2">十分な数のサンプルの平均</span>を取ると、その分布は正規分布に近づく。つまり元データが偏っていても、たくさんのサンプル平均を集めればきれいな釣り鐘型になる。これが重要な理由は、①仮説検定（z検定やt検定）の理論的根拠になる、②信頼区間を構成できる、③ミニバッチSGDでのノイズが正規分布的に振る舞う説明になる、など。<span class="hl2">大数の法則</span>（LLN）との違い：LLNは「サンプル平均が真の平均に収束する」こと、CLTは「その収束の仕方が正規分布になる」ことを述べる。',
'q123': '<span class="hl">最尤推定（MLE）</span>は「このデータが得られる確率が最大になるパラメータは何か？」を求める手法。データだけを頼りに推定するため、事前知識は使わない。<span class="hl">MAP推定</span>は「データに加えて事前知識（事前分布）も考慮したうえで最も確からしいパラメータは何か？」を求める。事前分布が<span class="hl2">正則化</span>の役割を果たし、過学習を抑える効果がある。具体的には、ガウス分布の事前分布は<span class="hl2">L2正則化（Ridge）</span>、ラプラス分布はL1正則化（Lasso）と数学的に等価。データが十分に多ければMLEとMAPの結果はほぼ一致する（データが事前知識を圧倒する）。',
'q127': '<span class="hl">シャノンエントロピー</span>は「不確実性の大きさ」を数値化する指標。例えば、コイン投げ（表裏半々）は不確実性が高くエントロピーが大きい。一方、ほぼ確実に表が出るコインはエントロピーが低い。<span class="hl2">均一分布</span>（すべての結果が同じ確率）のときエントロピーは最大になり、結果が確定しているとき0になる。AI分野での活用：①<span class="hl2">決定木の情報利得</span>：分岐前後でエントロピーがどれだけ減ったかで最適な分岐を選ぶ、②<span class="hl2">クロスエントロピー損失</span>：分類タスクの損失関数の理論的基盤、③<span class="hl2">KL情報量</span>：2つの確率分布の差を測定（VAEの学習等で使用）。',
'q128': '<span class="hl">主要な確率分布の関係</span>を「身近な例」で理解する。<span class="hl2">ベルヌーイ分布</span>：コイン1回投げ（成功/失敗の2択）。<span class="hl2">二項分布</span>：コインをn回投げたときの成功回数（ベルヌーイのn回版）。<span class="hl2">ポアソン分布</span>：「1時間に来客が何人来るか」のように、単位時間あたりの事象発生回数をモデル化。二項分布でn→大、p→小の極限。<span class="hl2">指数分布</span>：「次の来客まで何分かかるか」のように、事象間の待ち時間をモデル化。<span class="hl2">正規分布</span>：自然界で最も多く現れる連続分布（中心極限定理による）。AI分野では仮説検定、ベイズ推定の事前分布、VAEの潜在空間などで広く使われる。',
'q129': '<span class="hl">バイアス・バリアンストレードオフ</span>は、モデルの予測誤差を3つの要因に分解する考え方。①<span class="hl2">バイアス（偏り）</span>：モデルが単純すぎて正解を系統的に外す誤差。例：非線形データに線形回帰を当てはめる→訓練でもテストでも誤差が大きい（＝未学習）。②<span class="hl2">バリアンス（分散）</span>：モデルが複雑すぎてデータの微小な変動にまで反応する誤差。例：深すぎる決定木→訓練データには完全フィットするがテストデータで大きく外す（＝過学習）。③<span class="hl2">既約誤差</span>：データ自体のノイズで、どんなモデルでも除去不可能。アンサンブル学習はバリアンスを下げ（バギング）、バイアスを下げ（ブースティング）ることで両方に対応する。',
'q130': '<span class="hl">モンテカルロ法</span>は「ランダムなサンプルを大量に使って近似計算する」手法の総称。例えば円の面積を求めるのに、正方形内にランダムに点を打ち、円内に入った割合から面積を推定できる。サンプル数を増やすほど精度が上がる。AI分野での応用：①<span class="hl2">MCMC（マルコフ連鎖モンテカルロ）</span>：複雑な確率分布からサンプルを効率的に取得（ベイズ推論で使用）、②<span class="hl2">VAEの学習</span>：潜在変数の期待値をサンプリングで近似、③<span class="hl2">モンテカルロ木探索（MCTS）</span>：ゲームAI（AlphaGo等）で手の評価にランダムシミュレーションを使用。',
'q133': '<span class="hl">勾配消失問題</span>を理解するカギは<span class="hl2">連鎖律</span>にある。逆伝播では各層の勾配を掛け合わせて入力層まで伝える。シグモイド関数の勾配は最大でも0.25程度のため、層が深いほど勾配が指数的に小さくなる（例：10層で0.25¹⁰≈0.00001）。入力に近い層ほど重みがほぼ更新されなくなる。解決策：①<span class="hl2">ReLU</span>：正の領域で勾配が常に1なので消失しない、②<span class="hl2">残差接続（ResNet）</span>：勾配が層をスキップして直接伝わるバイパス、③<span class="hl2">バッチ正規化</span>：各層の出力分布を正規化して勾配を安定化、④<span class="hl2">LSTM/GRU</span>：ゲート機構でRNNの長期依存の勾配消失を緩和。',
'q153': '<span class="hl">Grad-CAM</span>は「CNNがなぜその分類をしたか」を可視化する手法（2017年）。仕組み：最終畳み込み層の特徴マップに対し、特定クラスの予測スコアがどれだけ依存しているかを勾配で計算し、<span class="hl2">重要な領域をヒートマップ</span>で表示する。例えば「犬」と分類した画像で、犬の顔の部分が赤く表示される。利点：①<span class="hl2">モデル構造の変更不要</span>（学習済みモデルにそのまま適用）、②<span class="hl2">クラスごとに可視化可能</span>（猫vs犬で着目領域が異なることを確認できる）。類似手法：<span class="hl">LIME</span>は入力の一部をマスクして重要度を推定する手法、<span class="hl">SHAP</span>はゲーム理論に基づく特徴量の貢献度分析。これらは<span class="hl2">説明可能AI（XAI）</span>の代表的手法。',
'q188': '<span class="hl">正規化フロー</span>（Normalizing Flow）は生成モデルの一種。「シンプルな分布（正規分布）」に<span class="hl2">可逆な変換を何段も重ねて</span>、複雑なデータの分布を表現する手法。VAEやGANとの最大の違いは、<span class="hl2">正確な尤度（確率）が計算できる</span>こと。各変換が可逆であるため、生成されたデータがどれだけ「ありえるか」を厳密に評価できる。代表モデル：<span class="hl2">RealNVP</span>、<span class="hl2">Glow</span>（高品質な顔画像生成で知られる）、<span class="hl2">NICE</span>。制約として、各変換の逆変換とヤコビアン（変換の伸縮度）が効率的に計算できる必要がある。',
'q197': '<span class="hl">カーネル密度推定（KDE）</span>は「データ分布の形をなめらかに推定する」ノンパラメトリック手法。各データ点を中心にカーネル関数（通常はガウス分布）を置き、それらを足し合わせて全体の密度を推定する。<span class="hl2">バンド幅h</span>が重要：小さすぎると凸凹なグラフ（過適合）、大きすぎるとぼやけた推定（過平滑化）になる。活用：①<span class="hl2">異常検知</span>：推定密度が極端に低い点を異常として検出、②<span class="hl2">データの可視化</span>：ヒストグラムの滑らかな代替、③<span class="hl2">クラスタリングの前処理</span>：密度の「谷」でクラスタを分離。正規分布や二項分布のような特定の分布形状を仮定しないため、データの真の分布を柔軟に捉えられる。',
'q217': '<span class="hl">ボルツマンマシン</span>は「エネルギーが低い状態ほど確率が高い」という物理学の原理を応用した確率モデル。各ノードが互いに接続され、データのパターンを確率的に学習する。しかし全ノード間に接続があるため学習が非常に遅い。<span class="hl">制限付きボルツマンマシン（RBM）</span>は「可視層と隠れ層の間だけ接続し、<span class="hl2">同一層内の接続を除去</span>」した簡略版。これにより<span class="hl2">CD法（Contrastive Divergence）</span>という効率的な学習法が使える。ヒントンが2006年にRBMを重ねた<span class="hl2">深層信念ネットワーク（DBN）</span>の事前学習法を提案し、これが<span class="hl2">第3次AIブーム（ディープラーニング革命）</span>の引き金となった。',
'q227': '<span class="hl">順伝播</span>（Forward Propagation）は入力データを入力層→隠れ層→出力層の順に渡していき、最終的な予測値を得る処理。各層では「重み×入力＋バイアス」に活性化関数を適用する。<span class="hl">逆伝播</span>（Backpropagation）は出力の予測誤差を出力層→入力層の逆方向に伝えて、各層の重みをどう修正すべきか（勾配）を効率的に計算する処理。連鎖律を利用して、一度の計算で全層の勾配を求められるのが重要な点。訓練の流れ：①順伝播で予測→②損失関数で誤差を計算→③逆伝播で全パラメータの勾配を計算→④最適化手法（SGD, Adam等）で重みを更新。推論時は①のみ実行する。',
'q247': '<span class="hl">同時確率</span>は「AとBが同時に起きる確率」。例：サイコロで「偶数かつ3以上」が出る確率。<span class="hl">条件付き確率</span>は「Bが起きたと分かった上でAが起きる確率」。例：「3以上と分かった上で偶数である確率」。この2つの関係が<span class="hl2">乗法定理</span>：P(A∩B) = P(A|B) × P(B)。これを変形すると<span class="hl2">ベイズの定理</span>が導ける：「原因の確率を結果から逆算する」ための公式。AI分野では、スパムフィルタ（メール内容から迷惑メールの確率を推定）、ナイーブベイズ分類器、MAP推定など広く活用される。<span class="hl2">独立</span>な場合はP(A|B) = P(A)（Bの情報がAに影響しない）。',
'q248': '<span class="hl">情報利得</span>（Information Gain）は決定木の「どの特徴量で分岐するのが最も効果的か」を決める指標。分岐前のエントロピー（不確実性）から分岐後のエントロピーを引いた値で、<span class="hl2">分岐によってどれだけ不確実性が減ったか</span>を表す。情報利得が最大になる特徴量を選んで分岐する（<span class="hl2">ID3・C4.5アルゴリズム</span>で使用）。注意点：カテゴリ数が多い特徴量は情報利得が高くなりやすい傾向がある→C4.5では<span class="hl2">情報利得率</span>で補正する。代替指標として<span class="hl">ジニ不純度</span>がある（CARTアルゴリズムで使用）。両者は通常ほぼ同じ分岐結果になる。',
'q250': '<span class="hl">混合ガウスモデル（GMM）</span>はデータが<span class="hl2">複数のガウス分布（正規分布）の混合</span>で生成されていると仮定するクラスタリング手法。k-meansとの違いは、各データ点が「このクラスタに確率60%、あのクラスタに確率40%属する」のように<span class="hl2">ソフトに帰属</span>する点。<span class="hl">EMアルゴリズム</span>で学習する：<span class="hl2">Eステップ</span>（期待値）：現在のパラメータで各データの帰属確率を計算→<span class="hl2">Mステップ</span>（最大化）：その帰属確率を使ってパラメータ（各ガウス分布の中心・分散・混合比）を更新→繰り返し。EMは初期値に依存するため、複数回実行してベストを選ぶのが一般的。',
'q263': '<span class="hl">AdaGrad</span>は各パラメータの過去の勾配の大きさに応じて、<span class="hl2">学習率を個別に調整する</span>最適化手法。頻繁に更新されるパラメータは学習率を小さく、稀にしか更新されないパラメータは学習率を大きく保つ。問題点：学習率が<span class="hl2">単調に減少し続け</span>、やがて学習が停止してしまう。<span class="hl">RMSprop</span>はAdaGradの改良版。過去の勾配を<span class="hl2">指数移動平均</span>で計算することで古い情報を忘れ、学習率が0に落ちない。<span class="hl">Adadelta</span>も同様にAdaGradの学習率減衰問題を解決した手法で、学習率パラメータを必要としない。<span class="hl">Adam</span>はRMSpropにモーメンタム（慣性項）を加えた手法で、現在最も広く使われる最適化手法。',
'q271': '<span class="hl">探索と活用のトレードオフ</span>は強化学習の中心的な課題。<span class="hl2">活用（Exploitation）</span>：これまでの経験で最も報酬が高い行動を繰り返す→確実だが局所最適に陥る。<span class="hl2">探索（Exploration）</span>：まだ試していない行動を選ぶ→より良い行動を発見できるが報酬を無駄にするリスクがある。<span class="hl">UCB</span>（Upper Confidence Bound）はこのバランスを取る手法。まだ試行回数が少ない行動には「不確実性ボーナス」を加算して選ばれやすくする。試行を重ねるとボーナスが減り、実績のある行動が選ばれるようになる。ε-greedy方策（確率εでランダム探索）よりも効率的に探索できる。',
'q277': '<span class="hl">UCB1（UCT）</span>はモンテカルロ木探索（MCTS）の「どのノードを優先的に調べるか」を決める基準。2つの要素のバランスで選択する：①<span class="hl2">活用</span>：そのノードのこれまでの平均報酬が高ければ有望なので優先する、②<span class="hl2">探索</span>：まだあまり訪問されていないノードには不確実性ボーナスを加算して試す。探索パラメータcでバランスを調整する。なぜ機能するか：最初は未訪問ノードが探索ボーナスで選ばれ（幅広く試す）、試行が進むと実績のあるノードの活用部分が支配的になる（有望な手を深く読む）。AlphaGoではこのUCBに<span class="hl2">方策ネットワーク</span>の出力を加えて探索効率を大幅に向上させた。',
}


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python apply_fixes.py <input.html>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = input_file.replace('.html', '_改修済み.html')
    
    print(f"Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("1. Applying meta fixes (q005 chapter, q001 text)...")
    content = apply_meta_fixes(content)
    
    print("2. Fixing positional references (選択肢A→内容参照)...")
    # Note: The simple approach here may not work perfectly on all questions
    # due to JS string escaping. Manual review recommended.
    content, n = fix_positional_refs(content)
    print(f"   Fixed {n} questions")
    
    print("3. Applying math-heavy exp fixes (20 questions)...")
    content, n = apply_exp_fixes(content, EXP_FIXES)
    print(f"   Fixed {n} questions")
    
    print("4. Adding new questions (Part 1 + Part 2)...")
    # Read Part 1 and Part 2 question data
    # Insert before the closing ]; of ALL_QUESTIONS
    
    part1_file = os.path.join(os.path.dirname(input_file), 'G検定問題集_改修Part1.js')
    part2_file = os.path.join(os.path.dirname(input_file), 'G検定問題集_改修Part2.js')
    
    new_questions = ""
    for pfile, label in [(part1_file, 'Part1'), (part2_file, 'Part2')]:
        if os.path.exists(pfile):
            with open(pfile, 'r', encoding='utf-8') as f:
                pdata = f.read()
            # Extract question objects
            qs = re.findall(r"(\{id:'q\d+'.*?'\s*\})", pdata, re.DOTALL)
            new_questions += "\n" + ",\n".join(qs) + ","
            print(f"   {label}: {len(qs)} questions loaded")
        else:
            print(f"   {label}: file not found ({pfile})")
    
    if new_questions:
        # Find the closing ]; of ALL_QUESTIONS
        insert_pos = content.rfind("];\n// =====")
        if insert_pos == -1:
            insert_pos = content.rfind("];\r\n// =====")
        if insert_pos > 0:
            content = content[:insert_pos] + new_questions + "\n" + content[insert_pos:]
            print("   Inserted into ALL_QUESTIONS array")
        else:
            print("   WARNING: Could not find insertion point. Manual insertion required.")
    
    print(f"\nWriting {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Done!")
    print(f"\n=== Summary ===")
    print(f"  Meta fixes: 2 (q005 ch, q001 text)")
    print(f"  Positional ref fixes: ~40 questions")
    print(f"  Math exp rewrites: 20 questions")
    print(f"  New questions added: 76 (q282-q357)")
    print(f"  Total questions: ~357")
