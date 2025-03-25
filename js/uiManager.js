// uiManager.js - UIコントロールとイベント管理

import appState from './state.js';
import { sizeOptions } from './config.js';
import { updateAllLandmarkSizes } from './landmarkManager.js';
import { drawCanvas } from './canvasManager.js';

// UI要素
let sizeSlider, sizeLabel;

// 初期化関数
export function initUIManager() {
    sizeSlider = document.getElementById('sizeSlider');
    sizeLabel = document.getElementById('sizeLabel');
    
    // サイズスライダーの初期設定
    sizeSlider.value = appState.landmarkSize;
    updateSizeLabel();
    
    // UIイベントリスナーのセットアップ
    setupUIEventListeners();
    
    // マウス移動とマウスアップのグローバルイベントリスナー
    setupGlobalEventListeners();
}

// サイズラベルの更新
function updateSizeLabel() {
    const sizeOption = sizeOptions.find(opt => opt.value === appState.landmarkSize);
    sizeLabel.textContent = sizeOption ? sizeOption.label : '小';
}

// UIイベントリスナーのセットアップ
function setupUIEventListeners() {
    // サイズスライダーのイベントリスナー
    sizeSlider.addEventListener('input', function() {
        appState.landmarkSize = parseInt(this.value);
        
        // サイズラベルを更新
        updateSizeLabel();
        
        // サイズ変更をコンソールに出力（デバッグ用）
        console.log(`ランドマークサイズを変更: ${appState.landmarkSize}`);
        
        // 全てのランドマークのサイズを更新
        updateAllLandmarkSizes();
    });
}

// グローバルイベントリスナーのセットアップ（ドキュメント全体）
function setupGlobalEventListeners() {
    // マウス移動
    document.addEventListener('mousemove', function(e) {
        if (!appState.isDragging) return;
        
        if (appState.selectedLandmark) {
            // ランドマークをドラッグ
            const dx = e.clientX - appState.selectedLandmark.startX;
            const dy = e.clientY - appState.selectedLandmark.startY;
            
            const newLeft = appState.selectedLandmark.startLeft + dx;
            const newTop = appState.selectedLandmark.startTop + dy;
            
            appState.selectedLandmark.element.style.left = `${newLeft}px`;
            appState.selectedLandmark.element.style.top = `${newTop}px`;
            
            // ランドマークの座標を更新（canvas内の座標として保存）
            appState.landmarks[appState.selectedLandmark.index].x = 
                (newLeft - appState.panX) / appState.zoomLevel;
            appState.landmarks[appState.selectedLandmark.index].y = 
                (newTop - appState.panY) / appState.zoomLevel;
        } else {
            // 画像をパン
            const dx = e.clientX - appState.lastMouseX;
            const dy = e.clientY - appState.lastMouseY;
            
            // 画像のサイズを計算（appStateから取得）
            if (!appState.isImageLoaded) return;
            
            // 画像のサイズを計算
            const imgWidth = appState.image.width * appState.zoomLevel;
            const imgHeight = appState.image.height * appState.zoomLevel;
            
            // 境界チェック - 余白を出さないようにする
            let newPanX = appState.panX + dx;
            let newPanY = appState.panY + dy;
            
            // 左右の制限
            if (newPanX > 0) newPanX = 0;
            if (newPanX + imgWidth < canvas.width) newPanX = canvas.width - imgWidth;
            
            // 上下の制限
            if (newPanY > 0) newPanY = 0;
            if (newPanY + imgHeight < canvas.height) newPanY = canvas.height - imgHeight;
            
            // パン位置を更新
            appState.panX = newPanX;
            appState.panY = newPanY;
            
            // キャンバスを再描画
            drawCanvas();
            
            // ランドマークの位置を更新
            updateAllLandmarkPositions();
            
            // マウス位置を更新
            appState.lastMouseX = e.clientX;
            appState.lastMouseY = e.clientY;
            