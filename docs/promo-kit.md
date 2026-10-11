# 홍보 키트 — Which Way Did It Move? (NeurIPS 2026)

바로 복사해서 올릴 수 있게 채널별 글과 첨부 파일을 정리했다. 숫자는 전부 `data/results.json`과 프로젝트 페이지 기준.

링크
- 페이지: https://jong980812.github.io/which-way-did-it-move/
- arXiv: https://arxiv.org/abs/2605.22823
- 코드: https://github.com/KHU-VLL/DeltaDirect
- 데이터: https://huggingface.co/datasets/KHUjongseo/Modirect-family
- HF Papers: https://huggingface.co/papers/2605.22823

---

## 0. 한 줄 메시지와 숫자 치트시트

한 줄: **Video-LLM은 공 색깔은 맞히지만 어느 쪽으로 움직였는지는 찍기 수준이다. 왜 그런지 찾아냈고, 고쳤다.**

| 쓸 숫자 | 값 |
|---|---|
| LLaVA-Video-7B, MoDirect-SynBench | 25.9% (chance 25%) |
| GPT-5 / Gemini 2.5 Flash / Qwen2.5-VL-72B | 58.9 / 53.5 / 57.3 |
| 모션 특화 모델 최고 (Motion-o-7B) | 37.7 |
| 프로브 정확도 encoder → projector → LLM | 99.8 → 96.5 → 95.3 |
| 모델 자신의 답 (Primitive-on-Syn) | 27.6 |
| 튜닝 후 in-domain | 27.6 → 99.5 |
| magnitude만 복원했을 때 OOD 회복 | 최대 +15.5 (Cutout-on-Real) |
| DeltaDirect, SynBench | 25.9 → 85.9 |
| DeltaDirect, RealBench (실제 영상 튜닝 데이터 0) | 43.1 → 64.5 (+21.4) |
| Qwen2-0.5B + DeltaDirect, SynBench | 92.4 |
| 데이터 | MoDirect-Inst 100K, SynBench 4 도메인 × 6K, RealBench 2,024 |

---

## 1. 첨부 파일 매핑

| 파일 | 어디에 | 비고 |
|---|---|---|
| `materials/hero_reel_1920x1200_intro.mp4` | X 1번 트윗, LinkedIn | 29초, 1.3MB. 첫 트윗은 반드시 영상 |
| `materials/hero_reel_1080x1080.gif` | GitHub README 상단, Reddit | 8.7MB (X는 15MB까지 가능) |
| `static/videos/hero_reel_4x5.mp4` | Instagram, LinkedIn 모바일 | 세로 4:5 |
| `static/images/teaser_b.png` | X 2번 트윗 (색 vs 방향 막대) | 가장 직관적인 한 장 |
| `static/images/figure_3.png` | X 3번 트윗 (binding gap) | |
| `static/images/fig5_magnitude.png` | X 4번 트윗 (magnitude deficit) | |
| `static/videos/deltadirect_reel_1920x840.mp4` | X 5번 트윗 (method) | 18초 |
| `static/videos/domains/*.mp4` | 데이터셋 트윗, HF 카드 | 4개 도메인 예시 영상 |
| `static/images/og-card.png` | 자동 (링크 미리보기) | 이번에 새로 그림, 아래 9절 |

---

## 2. X (Twitter) 스레드 — 영어

링크는 1번 트윗에 넣지 않는다(도달률이 떨어짐). 마지막 트윗과 답글에 몰아 넣는다.

**1/**
Video-LLMs can tell you the ball is yellow.
Ask which way it moved, and most of them are at chance.

GPT-5 gets 58.9%. Open 7B models sit at 25%.

We call it *directional motion blindness*. We find where it comes from, and we fix it.
NeurIPS 2026 🧵
📎 `hero_reel_1920x1200_intro.mp4`

**2/**
The test is as simple as it gets: one object, plain background, moving left / right / up / down. Four-way multiple choice, chance = 25%.

LLaVA-Video-7B: 25.9%. Motion-specialized models don't do better. Color on the same videos: >90%.
📎 `teaser_b.png`

**3/**
So where does the direction get lost?

We trace it with linear probes. Vision encoder: 99.8%. Projector: 96.5%. LLM hidden states: 95.3%.
The model's own answer: 27.6%.

The information is there. It never gets bound to the answer. We call this the *direction binding gap*.
📎 `figure_3.png`

**4/**
Instruction tuning on synthetic data closes the gap in-domain (27.6 → 99.5), but it reopens on harder domains.

Concept-vector analysis shows why: the direction concept points the *same way* across domains, but its *magnitude* shrinks with visual complexity. Rescaling magnitude alone recovers up to 15.5 points.
📎 `fig5_magnitude.png`

**5/**
The diagnosis says where to intervene: the projector.

DeltaDirect is a training-only auxiliary head that predicts normalized 2-D motion vectors from adjacent-frame feature deltas. Nothing changes at inference.
📎 `deltadirect_reel_1920x840.mp4`

**6/**
Results, LLaVA-Video-7B:
• MoDirect-SynBench 25.9% → 85.9%
• Real videos (SSv2 / KTH / TOMATO) +21.4 points, with zero real-world tuning data
• Standard video benchmarks preserved

A 0.5B LLM with DeltaDirect hits 92.4% on SynBench.

**7/**
Everything is released:
• MoDirect-Inst: 100K videos with per-frame motion vectors
• MoDirect-SynBench (4 domains × 6K) and RealBench
• Code, Apache-2.0

📄 https://arxiv.org/abs/2605.22823
🌐 https://jong980812.github.io/which-way-did-it-move/
💻 https://github.com/KHU-VLL/DeltaDirect
🤗 https://huggingface.co/datasets/KHUjongseo/Modirect-family

**8/**
Joint work with Hyuntak Lee (co-first), Sunghun Kim, Sooa Kim, Jihoon Chung (Princeton) and Jinwoo Choi, at KHU VLL.

Come find us in Sydney. If your Video-LLM also can't tell left from right, we'd love to hear about it.

답글(스레드 밖): "If you find this useful, the HF Papers page is here: https://huggingface.co/papers/2605.22823" 그리고 `@_akhaliq` 태그는 7번 트윗에 리플로.

---

## 3. LinkedIn — 영어

Our paper "Which Way Did It Move? Diagnosing and Overcoming Directional Motion Blindness in Video-LLMs" was accepted to NeurIPS 2026.

The finding is easy to state. Show a Video-LLM a single yellow ball moving left to right. It will tell you the ball is yellow. Ask which way it moved, and most models answer at chance level. GPT-5 reaches 58.9%; open 7B models sit at 25%.

We traced the failure through the model. Linear probes recover the direction from the vision encoder, the projector and the LLM hidden states at 95 to 99% accuracy. The model's own answer is correct 27.6% of the time. The information is present but never bound to the answer, which we call the direction binding gap.

The diagnosis pointed at one place to intervene. DeltaDirect is a training-only objective at the projector that predicts 2-D motion vectors from adjacent-frame feature deltas. It raises LLaVA-Video-7B from 25.9% to 85.9% on our synthetic benchmark and by 21.4 points on real videos, with no real-world tuning data and no change at inference.

We release MoDirect, a dataset family of 100K instruction-tuning videos plus synthetic and real benchmarks, and the code.

Paper: https://arxiv.org/abs/2605.22823
Project page: https://jong980812.github.io/which-way-did-it-move/
Code and data: https://github.com/KHU-VLL/DeltaDirect

With Hyuntak Lee, Sunghun Kim, Sooa Kim, Jihoon Chung and Jinwoo Choi. See you in Sydney.
📎 `hero_reel_1920x1200_intro.mp4`

---

## 4. 한국어 포스트 (X / 페이스북 / 링크드인)

NeurIPS 2026에 논문이 붙었습니다. "Which Way Did It Move?"

내용은 한 문장입니다. Video-LLM한테 노란 공이 왼쪽에서 오른쪽으로 가는 영상을 보여주면, 공이 노란색인 건 맞히는데 어느 쪽으로 갔는지는 찍는 수준(25%)입니다. GPT-5도 58.9%입니다.

왜 그런지 모델 안을 따라가 봤습니다. 비전 인코더, 프로젝터, LLM 히든 스테이트 어디서든 linear probe로 방향을 95~99% 읽어낼 수 있는데, 정작 모델의 답은 27.6%입니다. 정보는 있는데 답에 안 묶이는 것, 이걸 direction binding gap이라고 이름 붙였습니다.

그래서 프로젝터 단에서 인접 프레임 feature 차이로 2D 모션 벡터를 맞히게 하는 보조 목적함수(DeltaDirect)를 학습 때만 붙였습니다. 추론은 그대로인데 25.9% → 85.9%, 실제 영상에서는 실제 영상 학습 데이터 없이 +21.4p입니다.

데이터셋(MoDirect, 100K)과 코드도 공개했습니다.
논문 https://arxiv.org/abs/2605.22823
페이지 https://jong980812.github.io/which-way-did-it-move/

이현탁(공동 1저자), 김성훈, 김수아, 정지훈(Princeton), 최진우 교수님과 함께했습니다. 시드니에서 뵙겠습니다.
📎 `hero_reel_1920x1200_intro.mp4`

---

## 5. Reddit r/MachineLearning — [R]

제목:
**[R] Video-LLMs can't tell which way an object moved (near chance). We trace it to a "direction binding gap" and fix it with a projector-level objective (NeurIPS 2026)**

본문:
Paper: https://arxiv.org/abs/2605.22823 · Page: https://jong980812.github.io/which-way-did-it-move/ · Code: https://github.com/KHU-VLL/DeltaDirect · Data: https://huggingface.co/datasets/KHUjongseo/Modirect-family

**TL;DR.** On videos of a single object moving left/right/up/down, most Video-LLMs are at chance (25%). LLaVA-Video-7B: 25.9%, GPT-5: 58.9%. Color on the same videos is >90%. We call this directional motion blindness.

**Diagnosis.** Linear probes decode the direction from the vision encoder (99.8%), projector (96.5%) and LLM hidden states (95.3%), but the model's answer is 27.6%. The signal exists and never gets bound to the answer token (direction binding gap). It holds across every architecture and scale we tested. Synthetic instruction tuning closes the gap in-domain (→ 99.5%) but it reopens out of domain; concept-vector analysis shows the direction concept keeps the same orientation across domains while its magnitude drops with visual complexity. Rescaling magnitude alone recovers up to 15.5 points.

**Fix.** DeltaDirect: a training-only auxiliary head at the projector that predicts normalized 2-D motion vectors from adjacent-frame feature deltas. Inference unchanged. LLaVA-Video-7B goes 25.9 → 85.9 on MoDirect-SynBench and +21.4 on real videos (SSv2/KTH/TOMATO) with no real tuning data; standard video benchmarks are preserved. A Qwen2-0.5B LLM with DeltaDirect reaches 92.4.

**Released.** MoDirect-Inst (100K videos, per-frame motion vectors), MoDirect-SynBench (4 domains × 6K, 4-way MCQ), MoDirect-RealBench. Code is Apache-2.0, data is CC-BY-NC-4.0.

Happy to answer questions. The 26-second reel on the project page is the fastest way to see the whole story.

---

## 6. 개인 연락 템플릿 (관련 연구자, 3줄)

보낼 만한 사람: TOMATO, MotionSight, Motion-o, VideoLLaMA3, Qwen-VL 저자, 그리고 video-LLM 해석 가능성(probing / logit lens) 쪽 연구자. 인용한 논문 1저자들에게 보내는 게 답장률이 제일 높다.

> Subject: Video-LLMs and signed motion direction (NeurIPS 2026)
>
> Hi [Name], I'm Jongseo Lee from KHU VLL. We cited [their paper] in our NeurIPS 2026 paper on why Video-LLMs fail at signed motion direction (near chance on a single moving object) and how a projector-level objective fixes it (25.9% → 85.9%). The 26-second summary is at https://jong980812.github.io/which-way-did-it-move/ and the data is on Hugging Face. We evaluated [their model/benchmark] in Table 1, so I thought you'd want to see it. Any feedback is welcome, and we'd be glad to meet in Sydney.

---

## 7. 채널과 순서

**하루 안에 (D-day, 화~목, 한국 밤 10시~12시 = 미국 동부 오전)**
1. X 스레드 (2절). 올린 뒤 연구실 계정, 공저자, 지도교수님 리트윗.
2. 7번 트윗 리플에 `@_akhaliq` 태그. AK가 집어 주면 HF Papers 트래픽이 온다.
3. HF Papers 페이지에서 **authorship claim** (현재 업보트 1, 본인뿐). 공저자 전원 claim.
4. LinkedIn (3절). 영상 첨부.
5. 한국어 포스트 (4절): 페이스북 TensorFlow KR / AI Korea 그룹, 개인 계정.

**이틀 안에**
6. Reddit r/MachineLearning (5절). 미국 오전에 올리고 댓글에 2시간 붙어 있을 것.
7. GitHub README는 배지와 썸네일 SVG가 이미 잘 돼 있다. 정적 썸네일 자리에 `hero_reel_1080x1080.gif`를 넣으면 움직이는 첫인상이 된다. repo topics에 `video-llm`, `motion-understanding`, `benchmark`, `neurips-2026` 추가.
8. HF 데이터셋 카드 YAML에 `arxiv: 2605.22823` 태그가 **없다** (확인함). `tags:` 아래에 `- arxiv:2605.22823` 한 줄을 넣으면 HF Papers 페이지에 데이터셋이 자동으로 묶이고, 데이터셋 페이지에도 논문 링크가 뜬다.
9. 개인 연락 (6절) 5~10명.

**한 주 안에**
10. 경희대 홍보팀 / 소프트웨어융합대학 뉴스에 제보 (한국어 포스트 그대로 보내면 됨).
11. alphaXiv에 논문 페이지 확인, 저자 코멘트 하나 남기기.
12. NeurIPS 전: 포스터와 5분 영상에 hero reel 재사용. 포스터 QR은 프로젝트 페이지로.

---

## 8. 가장 잘 먹힐 훅 (어디서든 첫 문장)

- "It knows the ball is yellow. It doesn't know which way it went."
- "GPT-5 gets 58.9% on left/right/up/down."
- "The direction is decodable at 95% inside the model. The answer is 27.6%."

---

## 9. 이번에 바꾼 것

- `static/images/og-card.png`를 다시 그렸다. 이전 카드는 "Preprint 2026"이라고 적힌 텍스트 카드였다. 새 카드는 NeurIPS 2026 배지, 노란 공, Yellow ✓ / Leftward ✕, 25.9% → 85.9%. X, Slack, LinkedIn, 카톡 어디에 링크를 붙여도 이 그림이 뜬다.
- 소스는 `tools/og-card.html`, 렌더는 `tools/render-og.sh` (헤드리스 크롬). 문구를 바꾸면 스크립트만 다시 돌리면 된다.
- 배포 후 미리보기 캐시 갱신: X는 https://cards-dev.twitter.com/validator 가 없어졌으니 새 트윗에 붙여 보면 되고, LinkedIn은 https://www.linkedin.com/post-inspector/ 에 URL을 넣어 강제 갱신.
