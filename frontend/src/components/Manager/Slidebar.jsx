import React from "react";
import "./Slidebar.scss";

function Slidebar() {
    return (
        <div className="manager-slidebar">
            <h2 className="manager-slidebar__title">Quản lý hệ thống</h2>
            <ul className="manager-slidebar__menu">
                <li className="manager-slidebar__item">Dashboard</li>
                <li className="manager-slidebar__item">Quản lý người dùng</li>
                <li className="manager-slidebar__item">Quản lý bác sĩ</li>
                <li className="manager-slidebar__item">Quản lý dịch vụ</li>
                <li className="manager-slidebar__item">Báo cáo</li>
                <li className="manager-slidebar__item">Cài đặt</li>
            </ul>
        </div>
    );
}

export default Slidebar; 