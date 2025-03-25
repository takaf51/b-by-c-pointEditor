// uiManager.js - UIコントロールとイベント管理

import appState from './state.js';
import { sizeOptions } from './config.js';
import { updateAllLandmarkSizes, updateAllLandmarkPositions, hideAllLabels } from './landmarkManager.js';
import { drawCanvas, updateZoomInfo, pan, zoom } from './canvasManager.js';

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
    
    console.log('UI管理モジュールが初期化されました');
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
    const canvas = document.getElementById('canvas');
    
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
            
            // パン関数を呼び出し（canvasManagerから）
            pan(dx, dy);
            
            // マウス位置を更新
            appState.lastMouseX = e.clientX;
            appState.lastMouseY = e.clientY;
        }
    });
    
    // マウスアップ（ドラッグ終了）
    document.addEventListener('mouseup', function() {
        appState.isDragging = false;
    });
    
    // マウスリーブ（ドラッグ終了）
    document.addEventListener('mouseleave', function() {
        appState.isDragging = false;
    });
    
    // キーボードイベント
    document.addEventListener('keydown', function(e) {
        if (!appState.selectedLandmark) return;
        
        // 移動量
        const step = e.shiftKey ? 0.5 : 1;
        let dx = 0;
        let dy = 0;
        
        // 矢印キーの処理
        switch (e.key) {
            case 'ArrowLeft':
                dx = -step;
                break;
            case 'ArrowRight':
                dx = step;
                break;
            case 'ArrowUp':
                dy = -step;
                break;
            case 'ArrowDown':
                dy = step;
                break;
            default:
                return;
        }
        
        // 現在の位置を取得
        const currentLeft = parseInt(appState.selectedLandmark.element.style.left);
        const currentTop = parseInt(appState.selectedLandmark.element.style.top);
        
        // 新しい位置を設定
        appState.selectedLandmark.element.style.left = `${currentLeft + dx}px`;
        appState.selectedLandmark.element.style.top = `${currentTop + dy}px`;
        
        // ランドマークの座標を更新（canvas内の座標として保存）
        appState.landmarks[appState.selectedLandmark.index].x = 
            (currentLeft + dx - appState.panX) / appState.zoomLevel;
        appState.landmarks[appState.selectedLandmark.index].y = 
            (currentTop + dy - appState.panY) / appState.zoomLevel;
        
        // デフォルトのキー動作を防止
        e.preventDefault();
        
        // ラベルを非表示
        hideAllLabels();
    });
    
    // タッチイベント
    setupTouchEvents(canvas);
}

// タッチイベントのセットアップ
function setupTouchEvents(canvas) {
    // タッチ開始
    canvas.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            // ピンチ操作の初期距離を記録
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            appState.lastTouchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
        } else if (e.touches.length === 1) {
            // 単一タッチでパン操作の準備
            if (appState.zoomLevel <= 1.0) return;
            appState.isDragging = true;
            appState.lastMouseX = e.touches[0].clientX;
            appState.lastMouseY = e.touches[0].clientY;
        }
    });
    
    // タッチ移動
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        
        if (e.touches.length === 2) {
            // ピンチ操作でズーム
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            if (appState.lastTouchDistance > 0) {
                const delta = (currentDistance - appState.lastTouchDistance) / 200;
                
                // ピンチの中心点を計算
                const rect = canvas.getBoundingClientRect();
                const centerX = ((touch1.clientX + touch2.clientX) / 2) - rect.left;
                const centerY = ((touch1.clientY + touch2.clientY) / 2) - rect.top;
                
                // 中心点を指定してズーム
                zoom(delta, centerX, centerY);
            }
            
            appState.lastTouchDistance = currentDistance;
        } else if (e.touches.length === 1 && appState.isDragging) {
            // 単一タッチでパン
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            const dx = currentX - appState.lastMouseX;
            const dy = currentY - appState.lastMouseY;
            
            // パン処理
            pan(dx, dy);
            
            // タッチ位置を更新
            appState.lastMouseX = currentX;
            appState.lastMouseY = currentY;
        }
    });
    
    // タッチ終了
    canvas.addEventListener('touchend', function() {
        appState.isDragging = false;
        appState.lastTouchDistance = 0;
    });
}

// 外部からリセット処理を実行
export function resetView() {
    appState.resetView();
    updateZoomInfo();
    drawCanvas();
    updateAllLandmarkPositions();
}
