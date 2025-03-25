// main.js - アプリケーションのエントリーポイント

// モジュールのインポート
import { initCanvas } from './canvasManager.js';
import { initLandmarkManager } from './landmarkManager.js';
import { initUIManager } from './uiManager.js';

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('アプリケーションの初期化を開始します...');
    
    // キャンバスマネージャーの初期化
    initCanvas();
    
    // ランドマークマネージャーの初期化
    initLandmarkManager();
    
    // UIマネージャーの初期化
    initUIManager();
    
    console.log('アプリケーションが正常に初期化されました');
});
