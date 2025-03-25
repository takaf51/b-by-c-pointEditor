// canvasManager.js - キャンバスの描画と管理

import appState from './state.js';
import { imagePath, zoomConfig } from './config.js';
import { updateAllLandmarkPositions } from './landmarkManager.js';

// キャンバスと関連要素
let canvas, ctx, zoomInfoElement;


// 初期化関数
export function initCanvas() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    zoomInfoElement = document.getElementById('zoomInfo');
    
    // 画像読み込み
    const img = new Image();
    img.src = imagePath;
    img.onload = function() {
        appState.setImage(img);
        drawCanvas();
        updateZoomInfo();
    };
    
    // キャンバスイベントリスナーの設定
    setupCanvasEventListeners();
}

// キャンバスを描画する関数
export function drawCanvas() {
    if (!appState.isImageLoaded) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 背景画像を描画
    const imgWidth = appState.image.width * appState.zoomLevel;
    const imgHeight = appState.image.height * appState.zoomLevel;
    ctx.drawImage(appState.image, appState.panX, appState.panY, imgWidth, imgHeight);
}

// ズーム情報を更新
export function updateZoomInfo() {
    zoomInfoElement.textContent = `ズームレベル: ${appState.zoomLevel.toFixed(1)}x`;
}

// ズーム処理
export function zoom(delta, centerX, centerY) {
    // 現在のズームレベル
    const oldZoom = appState.zoomLevel;
    
    // 新しいズームレベルを計算
    const newZoom = Math.max(
        zoomConfig.minZoom, 
        Math.min(zoomConfig.maxZoom, appState.zoomLevel + delta)
    );
    
    // 変更がなければ終了
    if (newZoom === appState.zoomLevel) return;
    
    // ズームレベルを更新
    appState.zoomLevel = newZoom;
    updateZoomInfo();
    
    // ズームの中心点の決定
    let zoomCenterX, zoomCenterY;
    
    if (oldZoom >= 1.0) {
        // 等倍以上の場合はマウスポインターを中心にズーム
        zoomCenterX = centerX;
        zoomCenterY = centerY;
    } else {
        // 等倍未満の場合はキャンバスの中心を使用
        zoomCenterX = canvas.width / 2;
        zoomCenterY = canvas.height / 2;
    }
    
    // 中心点からの相対位置
    const relX = zoomCenterX - appState.panX;
    const relY = zoomCenterY - appState.panY;
    
    // 新しいパン位置を計算（ズームの中心点を維持）
    const newPanX = zoomCenterX - (relX / oldZoom) * newZoom;
    const newPanY = zoomCenterY - (relY / oldZoom) * newZoom;
    
    // パン位置を更新
    appState.panX = newPanX;
    appState.panY = newPanY;
    
    // キャンバスを再描画
    drawCanvas();
    
    // ランドマークの位置を更新
    updateAllLandmarkPositions();
}

// パン処理
export function pan(dx, dy) {
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
}

// キャンバスイベントリスナーの設定
function setupCanvasEventListeners() {
    // マウスダウン（パン開始）
    canvas.addEventListener('mousedown', function(e) {
        if (appState.zoomLevel <= 1.0) return; // ズームしていない場合はパンしない
        
        appState.isDragging = true;
        appState.lastMouseX = e.clientX;
        appState.lastMouseY = e.clientY;
        appState.selectedLandmark = null; // ランドマーク選択解除
    });
    
    // ダブルクリック（リセット）
    canvas.addEventListener('dblclick', function() {
        appState.resetView();
        updateZoomInfo();
        drawCanvas();
        updateAllLandmarkPositions();
    });
    
    // マウスホイール（ズーム）
    canvas.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        // Ctrlキーが押されている場合のみズーム
        if (e.ctrlKey || e.metaKey) {
            const delta = e.deltaY < 0 ? 0.1 : -0.1;
            
            // マウス位置を取得
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // マウス位置を中心にズーム
            zoom(delta, mouseX, mouseY);
        }
    });
    
    // タッチイベント
    setupTouchEvents();
}

// タッチイベントの設定
function setupTouchEvents() {
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
