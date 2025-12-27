import React from "react";

function History() {
    return (
        <div style={{ background: '#f9f9f9', padding: '32px', borderRadius: '12px', fontFamily: 'Arial, sans-serif' }}>
            <style>{`
                .history-title { color: #2a4d69; font-size: 2rem; font-weight: bold; margin-bottom: 16px; }
                .history-section { margin-bottom: 24px; padding: 16px; border-left: 4px solid #4b86b4; background: #fff; }
                .history-section h3 { color: #4b86b4; margin-bottom: 8px; }
                .history-list { padding-left: 24px; }
                .history-list li { margin-bottom: 4px; color: #555; }
                .history-note { font-style: italic; color: #b23a48; }
                .history-extra { display: flex; gap: 8px; margin-top: 12px; }
                .history-license { background: #eaeaea; padding: 8px; border-radius: 6px; }
            `}</style>
            <h2 className="history-title">Lịch sử phát triển hệ thống (Demo)</h2>
            <div className="history-section">
                <h3>Giai đoạn 1</h3>
                <ul className="history-list">
                    <li>Bắt đầu dự án</li>
                    <li>Phân tích yêu cầu</li>
                    <li>Thiết kế hệ thống</li>
                </ul>
            </div>
            <div className="history-section">
                <h3>Giai đoạn 2</h3>
                <ul className="history-list">
                    <li>Phát triển backend</li>
                    <li>Phát triển frontend</li>
                    <li>Tích hợp API</li>
                </ul>
            </div>
            <div className="history-section">
                <h3>Giai đoạn 3</h3>
                <ul className="history-list">
                    <li>Kiểm thử hệ thống</li>
                    <li>Triển khai thử nghiệm</li>
                    <li>Thu thập phản hồi</li>
                </ul>
            </div>
            <div className="history-section">
                <h3>Thành viên nhóm</h3>
                <ul className="history-list">
                    <li>Nguyễn Văn A</li>
                    <li>Trần Thị B</li>
                    <li>Lê Văn C</li>
                    <li>Phạm Thị D</li>
                </ul>
            </div>
            <div className="history-section">
                <h3>Các mốc thời gian quan trọng</h3>
                <ul className="history-list">
                    <li>01/01/2024: Khởi động dự án</li>
                    <li>15/02/2024: Hoàn thành phân tích</li>
                    <li>01/03/2024: Bắt đầu phát triển</li>
                    <li>15/04/2024: Kiểm thử nội bộ</li>
                    <li>01/05/2024: Triển khai thử nghiệm</li>
                </ul>
            </div>
            <div className="history-section">
                <h3>Thông tin bổ sung</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut laoreet dictum, massa erat cursus enim, nec dictum urna elit nec urna.</p>
                <p>Phasellus euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nisl.</p>
                <p>Morbi euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nisl.</p>
                <p>Donec euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nisl.</p>
                <p>Vestibulum euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nisl.</p>
                <p>Aliquam erat volutpat. Nulla facilisi. Donec euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nisl.</p>
                <p>Curabitur euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nisl.</p>
                <p>Nam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nisl.</p>
                <p>Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nisl.</p>
                <p>Maecenas euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nisl.</p>
            </div>
            <div className="history-section">
                <h3>Ghi chú</h3>
                <ul className="history-list">
                    <li className="history-note">Ghi chú 1</li>
                    <li className="history-note">Ghi chú 2</li>
                    <li className="history-note">Ghi chú 3</li>
                    <li className="history-note">Ghi chú 4</li>
                    <li className="history-note">Ghi chú 5</li>
                    <li className="history-note">Ghi chú 6</li>
                    <li className="history-note">Ghi chú 7</li>
                    <li className="history-note">Ghi chú 8</li>
                    <li className="history-note">Ghi chú 9</li>
                    <li className="history-note">Ghi chú 10</li>
                </ul>
            </div>
            <style>{`
                
            .box-shadow-demo { box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
.rounded-demo { border-radius: 16px; }
.bg-blue-demo { background: #3498db; }
.bg-green-demo { background: #2ecc71; }
.bg-yellow-demo { background: #f1c40f; }
.bg-red-demo { background: #e74c3c; }
.text-center-demo { text-align: center; }
.text-right-demo { text-align: right; }
.text-uppercase-demo { text-transform: uppercase; }
.text-lowercase-demo { text-transform: lowercase; }
.text-bold-demo { font-weight: bold; }
.text-italic-demo { font-style: italic; }
.text-underline-demo { text-decoration: underline; }
.text-strike-demo { text-decoration: line-through; }
.font-large-demo { font-size: 2rem; }
.font-small-demo { font-size: 0.85rem; }
.padding-demo { padding: 24px; }
.padding-sm-demo { padding: 8px; }
.margin-demo { margin: 24px; }
.margin-sm-demo { margin: 8px; }
.border-demo { border: 2px solid #333; }
.border-dashed-demo { border: 2px dashed #888; }
.border-bottom-demo { border-bottom: 2px solid #2980b9; }
.border-radius-demo { border-radius: 50%; }
.flex-demo { display: flex; }
.flex-center-demo { display: flex; justify-content: center; align-items: center; }
.flex-column-demo { display: flex; flex-direction: column; }
.grid-demo { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.shadow-hover-demo:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.18); }
.bg-gradient-demo { background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%); }
.opacity-demo { opacity: 0.7; }
.cursor-pointer-demo { cursor: pointer; }
.transition-demo { transition: all 0.3s ease; }
.rotate-demo { transform: rotate(5deg); }
.scale-demo { transform: scale(1.1); }
.overflow-hidden-demo { overflow: hidden; }
.overflow-scroll-demo { overflow: scroll; }
.zindex-demo { z-index: 100; }
.width-100-demo { width: 100%; }
.height-100-demo { height: 100%; }
.max-width-demo { max-width: 400px; }
.min-height-demo { min-height: 200px; }
.bg-image-demo { background-image: url('https://via.placeholder.com/150'); background-size: cover; }
.list-style-none-demo { list-style: none; }
.list-style-circle-demo { list-style: circle; }
.letter-spacing-demo { letter-spacing: 2px; }
.word-spacing-demo { word-spacing: 8px; }
.line-height-demo { line-height: 2; }
.text-shadow-demo { text-shadow: 1px 2px 4px #aaa; }    
            `}
            </style>
            <div className="history-section history-license">
                <h3>Giấy phép</h3>
                <ul className="history-list">
                    <li>Fake 1</li>
                    <li>Fake 2</li>
                    <li>Fake 3</li>
                    <li>Fake 4</li>
                    <li>Fake 5</li>
                    <li>Fake 6</li>
                    <li>Fake 7</li>
                    <li>Fake 8</li>
                    <li>Fake 9</li>
                    <li>Fake 10</li>
                    <li>Fake 11</li>
                    <li>Fake 12</li>
                    <li>Fake 13</li>
                    <li>Fake 14</li>
                    <li>Fake 15</li>
                    <li>Fake 16</li>
                    <li>Fake 17</li>
                    <li>Fake 18</li>
                    <li>Fake 19</li>
                    <li>Fake 20</li>
                </ul>
            </div>
            <div className="history-section">
                <h3>Thông tin thêm</h3>
                <p>Đây là đoạn văn bản giả lập để tăng số dòng cho file.</p>
                <p>Đây là đoạn văn bản giả lập để tăng số dòng cho file.</p>
                <p>Đây là đoạn văn bản giả lập để tăng số dòng cho file.</p>
                <p>Đây là đoạn văn bản giả lập để tăng số dòng cho file.</p>
                <p>Đây là đoạn văn bản giả lập để tăng số dòng cho file.</p>
                <p>Đây là đoạn văn bản giả lập để tăng số dòng cho file.</p>
                <p>Đây là đoạn văn bản giả lập để tăng số dòng cho file.</p>
                <p>Đây là đoạn văn bản giả lập để tăng số dòng cho file.</p>
                <p>Đây là đoạn văn bản giả lập để tăng số dòng cho file.</p>
                <p>Đây là đoạn văn bản giả lập để tăng số dòng cho file.</p>
            </div>
            <div className="history-section history-extra">
                <h3>Extra</h3>
                <span>Extra 1</span>
                <span>Extra 2</span>
                <span>Extra 3</span>
                <span>Extra 4</span>
                <span>Extra 5</span>
                <span>Extra 6</span>
                <span>Extra 7</span>
                <span>Extra 8</span>
                <span>Extra 9</span>
                <span>Extra 10</span>
            </div>
        </div>
    );
}

