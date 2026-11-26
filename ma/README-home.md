# 首頁維護說明

入口：`index.html`。使用原生 HTML、CSS、JavaScript；不需要建置或新增外掛。

## 檔案

- `css/home.css`：七屏版型、RWD、卡片與輪播樣式。
- `js/home.js`：輪播、觸控、鍵盤操作，以及應徵網址共用設定。
- `css/common/HeaderFooter.css`：正式頁共用的頁首、頁尾與基礎樣式，直接維護此 CSS。
- `css/common/fonts.css`、`font/`：使用使用者提供的 Roboto、Roboto Serif、Noto Sans TC 三個可變字型轉成的 WOFF2；保留原始 TTF，不依賴 Google Fonts 線上請求。
- `img/home/`：首頁照片、主視覺及圖示；照片已縮至 1600px 寬的 JPEG。

## 七屏與錨點

1. `#hero`：首屏主視覺。
2. `#plans`：MA／TA／TMA 計畫。
3. `#projects`：重要金控專案。
4. `#international`：國際舞台歷練。
5. `#fintech`：引領金融科技。
6. `#learning`：多元創新學習。
7. `#apply`：應徵邀請。

首頁保留原有 footer（客服、常見問題、個資告知與地址），未重新設計 footer。手機版依桌機設計延伸成直向排列，並非另有手機版 Figma 定稿。

## 待替換內容

- 應徵、校園徵才網址依需求使用 `#`；點擊時不跳到頁首。正式應徵網址修改 header 的 `.btn_join`，頁尾應徵入口會自動同步。校園徵才網址另在 `.float_action_btn a` 修改。
- `plan.html`、`ma.html`、`ta.html`、`tma.html`、`faq.html` 尚未建立；header 的次選單名稱與 `#section-1`～`#section-4` 是暫定值。
- 國際歷練的第二、三張目前使用 `img/home/international-placeholder.svg`，在 HTML 對應的 `.international-slide` 修改照片與說明即可。
- 首屏使用 Figma 的靜態背景素材；目前未串接影片或 GSAP 滾動動畫。

## 輪播

兩組輪播都不自動播放。國際歷練支援圓點、前後按鈕與觸控左右切換；學習卡片支援水平滑動、圓點與前後按鈕。焦點在輪播內時，可用左右方向鍵切換。設定減少動態效果時會停用平滑捲動。
