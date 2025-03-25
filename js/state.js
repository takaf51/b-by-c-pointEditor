// state.js - アプリケーションの状態を管理

import { zoomConfig, initialLandmarks } from './config.js';

// アプリケーションの状態クラス
class AppState {
    constructor() {
        // ズーム関連の状態
        this.zoomLevel = zoomConfig.initialZoom;
        this.panX = 0;
        this.panY = 0;
        
        // マウス・ドラッグ関連の状態
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.lastTouchDistance = 0;
        
        // ランドマーク関連の状態
        this.landmarks = [...initialLandmarks]; // 配列をコピー
        this.selectedLandmark = null;
        this.landmarkSize = 1;
        
        // 画像関連の状態
        this.image = null;
        this.isImageLoaded = false;
    }
    
    // 状態リセットメソッド
    resetView() {
        this.zoomLevel = zoomConfig.initialZoom;
        this.panX = 0;
        this.panY = 0;
    }
    
    // ランドマーク選択メソッド
    selectLandmark(landmarkData) {
        this.selectedLandmark = landmarkData;
    }
    
    // ランドマーク位置更新メソッド
    updateLandmarkPosition(index, x, y) {
        if (index >= 0 && index < this.landmarks.length) {
            this.landmarks[index].x = x;
            this.landmarks[index].y = y;
        }
    }
    
    // ランドマークサイズ更新メソッド
    updateLandmarkSize(size) {
        this.landmarkSize = size;
    }
    
    // 画像設定メソッド
    setImage(img) {
        this.image = img;
        this.isImageLoaded = true;
    }
}

// シングルトンインスタンスを作成して公開
const appState = new AppState();
export default appState;
