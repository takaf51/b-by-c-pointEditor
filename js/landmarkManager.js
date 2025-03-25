// landmarkManager.js - ランドマークの作成と管理

import appState from './state.js';
import { sizeOptions } from './config.js';

// ランドマークのコンテナ要素
let landmarksContainer;

// 初期化関数
export function initLandmarkManager() {
    landmarksContainer = document.getElementById('landmarks');
    createLandmarks();
    setupKeyboardEventListeners();
}

// ランドマークを生成する関数
export function createLandmarks() {
    // 既存のランドマークを削除
    landmarksContainer.innerHTML = '';
    
    // 各ランドマークを作成
    appState.landmarks.forEach((landmark, index) => {
        const element = document.createElement('div');
        element.className = 'landmark';
        element.setAttribute('data-index', index);
        
        // サイズに基づいてスタイルを設定
        updateLandmarkSize(element);
        
        // ラベルを作成
        const label = document.createElement('div');
        label.className = 'landmark-label';
        label.textContent = landmark.name;
        label.style.cssText = `
            position: absolute;
            top: -20px;
            left: 5px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 2px 5px;
            font-size: 12px;
            white-space: nowrap;
            display: none;
        `;
        
        // ランドマークの位置を設定
        updateLandmarkPosition(element, landmark, label);
        
        // ランドマークをコンテナに追加
        element.appendChild(label);
        landmarksContainer.appendChild(element);
        
        // ランドマークのイベントリスナー
        setupLandmarkEvents(element, index, label);
    });
}

// ランドマークのサイズを更新する関数
export function updateLandmarkSize(element) {
    const sizeOption = sizeOptions.find(opt => opt.value === appState.landmarkSize);
    
    if (!sizeOption) return;
    
    // 選択状態に基づいて色を決定
    const isSelected = appState.selectedLandmark && 
                       appState.selectedLandmark.element === element;
    const backgroundColor = isSelected ? 'red' : 'blue';
    const borderColor = isSelected ? 'yellow' : 'white';
    
    // 明示的にすべてのスタイルプロパティを設定
    element.style.position = 'absolute';
    element.style.width = `${sizeOption.width}px`;
    element.style.height = `${sizeOption.height}px`;
    element.style.borderRadius = '50%';
    element.style.backgroundColor = backgroundColor;
    element.style.borderWidth = `${sizeOption.borderWidth}px`;
    element.style.borderStyle = 'solid';
    element.style.borderColor = borderColor;
    element.style.transform = 'translate(-50%, -50%)';
    element.style.cursor = 'move';
    element.style.zIndex = '100';
}

// ランドマークの位置を更新
export function updateLandmarkPosition(element, landmark) {
    if (!element || !landmark) return;
    
    // canvas内の座標からズームとパンを考慮した表示位置を計算
    const x = landmark.x * appState.zoomLevel + appState.panX;
    const y = landmark.y * appState.zoomLevel + appState.panY;
    
    // 位置を設定
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
}

// 全てのランドマークのサイズを更新
export function updateAllLandmarkSizes() {
    console.log(`updateAllLandmarkSizes: 全ランドマークのサイズを更新中...`);
    const landmarkElements = document.querySelectorAll('.landmark');
    console.log(`検出されたランドマーク数: ${landmarkElements.length}`);
    
    landmarkElements.forEach((element) => {
        updateLandmarkSize(element);
    });
}

// すべてのランドマークの位置を更新
export function updateAllLandmarkPositions() {
    const landmarkElements = document.querySelectorAll('.landmark');
    landmarkElements.forEach((element, index) => {
        const landmark = appState.landmarks[index];
        updateLandmarkPosition(element, landmark);
    });
}

// 選択されたランドマークのスタイルを設定
function selectLandmark(element) {
    // 前の選択をリセット
    const allLandmarks = document.querySelectorAll('.landmark');
    allLandmarks.forEach(lm => {
        lm.style.backgroundColor = 'blue';
        lm.style.borderColor = 'white';
    });
    
    // 新しい選択スタイル
    element.style.backgroundColor = 'red';
    element.style.borderColor = 'yellow';
}

// すべてのラベルを非表示
export function hideAllLabels() {
    const allLabels = document.querySelectorAll('.landmark-label');
    allLabels.forEach(label => {
        label.style.display = 'none';
    });
    
    // 既存のタイマーをクリア
    if (window.labelTimer) {
        clearTimeout(window.labelTimer);
    }
    
    // 5秒後にラベルを表示
    window.labelTimer = setTimeout(function() {
        showAllLabels();
    }, 5000);
}

// すべてのラベルを表示
function showAllLabels() {
    const allLabels = document.querySelectorAll('.landmark-label');
    allLabels.forEach(label => {
        label.style.opacity = '0';
        label.style.display = 'block';
        
        // フェードイン
        let opacity = 0;
        const intervalId = setInterval(function() {
            opacity += 0.1;
            label.style.opacity = opacity;
            if (opacity >= 1) {
                clearInterval(intervalId);
            }
        }, 100);
    });
}

// ランドマークイベントの設定
function setupLandmarkEvents(element, index, label) {
    // マウスダウン
    element.addEventListener('mousedown', function(e) {
        e.preventDefault();
        
        // 選択スタイルを適用
        selectLandmark(element);
        
        // 全てのラベルを非表示
        hideAllLabels();
        
        // ドラッグ開始状態
        appState.isDragging = true;
        appState.selectedLandmark = {
            element: element,
            index: index,
            startX: e.clientX,
            startY: e.clientY,
            startLeft: parseInt(element.style.left),
            startTop: parseInt(element.style.top),
            label: label
        };
        
        // イベント伝播を停止
        e.stopPropagation();
    });
    
    // マウスオーバー
    element.addEventListener('mouseover', function() {
        element.style.backgroundColor = 'red';
    });
    
    // マウスアウト
    element.addEventListener('mouseout', function() {
        if (appState.selectedLandmark && appState.selectedLandmark.element === element) return;
        element.style.backgroundColor = 'blue';
    });
}

// キーボードイベントリスナーの設定
function setupKeyboardEventListeners() {
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
}
