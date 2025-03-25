// config.js - アプリケーションの設定と初期状態

// ズーム関連の設定
export const zoomConfig = {
    minZoom: 0.5,
    maxZoom: 3.0,
    initialZoom: 1.0
};

// ランドマークの初期データ
export const initialLandmarks = [
    { name: "V1", x: 192, y: 272 }, 
    { name: "V2", x: 332, y: 264 }, 
    { name: "V3", x: 207, y: 331 }, 
    { name: "V4", x: 321, y: 324 }
];

// サイズ設定
export const sizeOptions = [
    { value: 1, label: '小', width: 1, height: 1, borderWidth: 1 },
    { value: 2, label: '中', width: 10, height: 10, borderWidth: 2 },
    { value: 3, label: '大', width: 14, height: 14, borderWidth: 2 }
];

// 画像パス
export const imagePath = 'sample.png';
