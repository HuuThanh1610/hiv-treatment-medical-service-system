import React, { useState } from "react";
import "./ManagerDashboard.scss";

const mockData = [
    { id: 1, name: "Nguyễn Văn A", role: "Bác sĩ", status: "Hoạt động", lastLogin: "2024-06-20" },
    { id: 2, name: "Trần Thị B", role: "Y tá", status: "Nghỉ phép", lastLogin: "2024-06-18" },
    { id: 3, name: "Lê Văn C", role: "Quản lý", status: "Hoạt động", lastLogin: "2024-06-19" },
    { id: 4, name: "Phạm Thị D", role: "Bác sĩ", status: "Hoạt động", lastLogin: "2024-06-17" },
    { id: 5, name: "Vũ Văn E", role: "Y tá", status: "Nghỉ phép", lastLogin: "2024-06-15" },
    { id: 6, name: "Đỗ Thị F", role: "Quản lý", status: "Hoạt động", lastLogin: "2024-06-14" },
    { id: 7, name: "Ngô Văn G", role: "Bác sĩ", status: "Hoạt động", lastLogin: "2024-06-13" },
    { id: 8, name: "Hoàng Thị H", role: "Y tá", status: "Nghỉ phép", lastLogin: "2024-06-12" },
    { id: 9, name: "Phan Văn I", role: "Quản lý", status: "Hoạt động", lastLogin: "2024-06-11" },
    { id: 10, name: "Bùi Thị K", role: "Bác sĩ", status: "Hoạt động", lastLogin: "2024-06-10" },
    { id: 11, name: "Nguyễn Thị L", role: "Y tá", status: "Hoạt động", lastLogin: "2024-06-09" },
    { id: 12, name: "Trần Văn M", role: "Bác sĩ", status: "Nghỉ phép", lastLogin: "2024-06-08" },
    { id: 13, name: "Lê Thị N", role: "Quản lý", status: "Hoạt động", lastLogin: "2024-06-07" },
];

const stats = [
    { label: "Tổng nhân sự", value: 120 },
    { label: "Bác sĩ", value: 45 },
    { label: "Y tá", value: 60 },
    { label: "Quản lý", value: 15 },
    { label: "Nhân sự mới", value: 5 },
    { label: "Đang nghỉ phép", value: 8 },
    { label: "Đang làm việc", value: 112 },
];

const notifications = [
    { id: 1, message: "Có 2 nhân sự mới đăng ký hôm nay." },
    { id: 2, message: "Hệ thống sẽ bảo trì vào 22:00 tối nay." },
    { id: 3, message: "Cập nhật chính sách bảo mật mới." },
    { id: 4, message: "Nhân sự Nguyễn Văn A vừa cập nhật hồ sơ." },
    { id: 5, message: "Có 1 nhân sự vừa nghỉ phép." },
    { id: 6, message: "Thêm chức năng báo cáo mới cho quản lý." },
];

const chartData = [
    { month: "Tháng 1", doctors: 10, nurses: 15, managers: 3 },
    { month: "Tháng 2", doctors: 12, nurses: 14, managers: 4 },
    { month: "Tháng 3", doctors: 13, nurses: 16, managers: 5 },
    { month: "Tháng 4", doctors: 15, nurses: 18, managers: 6 },
    { month: "Tháng 5", doctors: 14, nurses: 17, managers: 7 },
    { month: "Tháng 6", doctors: 16, nurses: 19, managers: 8 },
    { month: "Tháng 7", doctors: 17, nurses: 20, managers: 9 },
    { month: "Tháng 8", doctors: 18, nurses: 21, managers: 10 },
    { month: "Tháng 9", doctors: 19, nurses: 22, managers: 11 },
];

function Sidebar({ onSelect, selected }) {
    const items = [
        "Tổng quan",
        "Nhân sự",
        "Báo cáo",
        "Thông báo",
        "Cài đặt",
    ];
    return (
        <aside className="manager-sidebar">
            <div className="sidebar-title">Manager</div>
            <ul>
                {items.map((item, idx) => (
                    <li
                        key={item}
                        className={selected === idx ? "selected" : ""}
                        onClick={() => onSelect(idx)}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </aside>
    );
}

function Header() {
    return (
        <header className="manager-header">
            <div className="logo">HIVCare Manager Dashboard</div>
            <div className="user-info">
                <span>Xin chào, Quản lý!</span>
                <img src="https://ui-avatars.com/api/?name=Manager" alt="avatar" />
            </div>
        </header>
    );
}

function StatCards() {
    return (
        <div className="stat-cards">
            {stats.map((stat) => (
                <div className="stat-card" key={stat.label}>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                </div>
            ))}
        </div>
    );
}

function NotificationPanel() {
    return (
        <div className="notification-panel">
            <h3>Thông báo</h3>
            <ul>
                {notifications.map((n) => (
                    <li key={n.id}>{n.message}</li>
                ))}
            </ul>
        </div>
    );
}

function DataTable() {
    return (
        <div className="data-table">
            <h3>Danh sách nhân sự</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Họ tên</th>
                        <th>Chức vụ</th>
                        <th>Trạng thái</th>
                        <th>Lần đăng nhập cuối</th>
                    </tr>
                </thead>
                <tbody>
                    {mockData.map((row) => (
                        <tr key={row.id}>
                            <td>{row.id}</td>
                            <td>{row.name}</td>
                            <td>{row.role}</td>
                            <td>{row.status}</td>
                            <td>{row.lastLogin}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Chart() {
    // Simple bar chart using divs (no external lib)
    const max = Math.max(...chartData.map(d => d.doctors + d.nurses + d.managers));
    return (
        <div className="chart">
            <h3>Biểu đồ nhân sự theo tháng</h3>
            <div className="chart-bars">
                {chartData.map((d, idx) => {
                    const total = d.doctors + d.nurses + d.managers;
                    return (
                        <div className="chart-bar" key={d.month}>
                            <div className="bar" style={{ height: `${(total / max) * 120}px` }}>
                                <span className="bar-label">{total}</span>
                            </div>
                            <div className="month-label">{d.month}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Settings() {
    return (
        <div className="settings-panel">
            <h3>Cài đặt hệ thống</h3>
            <form>
                <label>
                    Email nhận thông báo:
                    <input type="email" placeholder="manager@hivcare.com" />
                </label>
                <label>
                    Ngôn ngữ:
                    <select>
                        <option>Tiếng Việt</option>
                        <option>English</option>
                    </select>
                </label>
                <button type="submit">Lưu thay đổi</button>
            </form>
        </div>
    );
}

export default function ManagerDashboard() {
    const [selected, setSelected] = useState(0);
    return (
        <div className="manager-dashboard">
            <Sidebar onSelect={setSelected} selected={selected} />
            <div className="dashboard-main">
                <Header />
                <div className="dashboard-content">
                    {selected === 0 && (
                        <>
                            <StatCards />
                            <Chart />
                            <NotificationPanel />
                        </>
                    )}
                    {selected === 1 && <DataTable />}
                    {selected === 2 && <Chart />}
                    {selected === 3 && <NotificationPanel />}
                    {selected === 4 && <Settings />}
                </div>
            </div>
        </div>
    );
}
import React, { useState } from "react";
import "./ManagerDashboard.scss";

const mockData2 = [
    { id: 1, name: "Nguyễn Văn A", role: "Bác sĩ", status: "Hoạt động", lastLogin: "2024-06-20" },
    { id: 2, name: "Trần Thị B", role: "Y tá", status: "Nghỉ phép", lastLogin: "2024-06-18" },
    { id: 3, name: "Lê Văn C", role: "Quản lý", status: "Hoạt động", lastLogin: "2024-06-19" },
    { id: 4, name: "Phạm Thị D", role: "Bác sĩ", status: "Hoạt động", lastLogin: "2024-06-17" },
    { id: 5, name: "Vũ Văn E", role: "Y tá", status: "Nghỉ phép", lastLogin: "2024-06-15" },
    { id: 6, name: "Đỗ Thị F", role: "Quản lý", status: "Hoạt động", lastLogin: "2024-06-14" },
    { id: 7, name: "Ngô Văn G", role: "Bác sĩ", status: "Hoạt động", lastLogin: "2024-06-13" },
    { id: 8, name: "Hoàng Thị H", role: "Y tá", status: "Nghỉ phép", lastLogin: "2024-06-12" },
    { id: 9, name: "Phan Văn I", role: "Quản lý", status: "Hoạt động", lastLogin: "2024-06-11" },
    { id: 10, name: "Bùi Thị K", role: "Bác sĩ", status: "Hoạt động", lastLogin: "2024-06-10" },
    { id: 11, name: "Nguyễn Thị L", role: "Y tá", status: "Hoạt động", lastLogin: "2024-06-09" },
    { id: 12, name: "Trần Văn M", role: "Bác sĩ", status: "Nghỉ phép", lastLogin: "2024-06-08" },
    { id: 13, name: "Lê Thị N", role: "Quản lý", status: "Hoạt động", lastLogin: "2024-06-07" },
];

const stats2 = [
    { label: "Tổng nhân sự", value: 120 },
    { label: "Bác sĩ", value: 45 },
    { label: "Y tá", value: 60 },
    { label: "Quản lý", value: 15 },
    { label: "Nhân sự mới", value: 5 },
    { label: "Đang nghỉ phép", value: 8 },
    { label: "Đang làm việc", value: 112 },
];

const notifications2 = [
    { id: 1, message: "Có 2 nhân sự mới đăng ký hôm nay." },
    { id: 2, message: "Hệ thống sẽ bảo trì vào 22:00 tối nay." },
    { id: 3, message: "Cập nhật chính sách bảo mật mới." },
    { id: 4, message: "Nhân sự Nguyễn Văn A vừa cập nhật hồ sơ." },
    { id: 5, message: "Có 1 nhân sự vừa nghỉ phép." },
    { id: 6, message: "Thêm chức năng báo cáo mới cho quản lý." },
];

const chartData2 = [
    { month: "Tháng 1", doctors: 10, nurses: 15, managers: 3 },
    { month: "Tháng 2", doctors: 12, nurses: 14, managers: 4 },
    { month: "Tháng 3", doctors: 13, nurses: 16, managers: 5 },
    { month: "Tháng 4", doctors: 15, nurses: 18, managers: 6 },
    { month: "Tháng 5", doctors: 14, nurses: 17, managers: 7 },
    { month: "Tháng 6", doctors: 16, nurses: 19, managers: 8 },
    { month: "Tháng 7", doctors: 17, nurses: 20, managers: 9 },
    { month: "Tháng 8", doctors: 18, nurses: 21, managers: 10 },
    { month: "Tháng 9", doctors: 19, nurses: 22, managers: 11 },
];

function Sidebar({ onSelect, selected }) {
    const items = [
        "Tổng quan",
        "Nhân sự",
        "Báo cáo",
        "Thông báo",
        "Cài đặt",
    ];
    return (
        <aside className="manager-sidebar">
            <div className="sidebar-title">Manager</div>
            <ul>
                {items.map((item, idx) => (
                    <li
                        key={item}
                        className={selected === idx ? "selected" : ""}
                        onClick={() => onSelect(idx)}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </aside>
    );
}

function Header() {
    return (
        <header className="manager-header">
            <div className="logo">HIVCare Manager Dashboard</div>
            <div className="user-info">
                <span>Xin chào, Quản lý!</span>
                <img src="https://ui-avatars.com/api/?name=Manager" alt="avatar" />
            </div>
        </header>
    );
}

function StatCards() {
    return (
        <div className="stat-cards">
            {stats.map((stat) => (
                <div className="stat-card" key={stat.label}>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                </div>
            ))}
        </div>
    );
}

function NotificationPanel() {
    return (
        <div className="notification-panel">
            <h3>Thông báo</h3>
            <ul>
                {notifications.map((n) => (
                    <li key={n.id}>{n.message}</li>
                ))}
            </ul>
        </div>
    );
}

function DataTable() {
    return (
        <div className="data-table">
            <h3>Danh sách nhân sự</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Họ tên</th>
                        <th>Chức vụ</th>
                        <th>Trạng thái</th>
                        <th>Lần đăng nhập cuối</th>
                    </tr>
                </thead>
                <tbody>
                    {mockData.map((row) => (
                        <tr key={row.id}>
                            <td>{row.id}</td>
                            <td>{row.name}</td>
                            <td>{row.role}</td>
                            <td>{row.status}</td>
                            <td>{row.lastLogin}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Chart() {
    // Simple bar chart using divs (no external lib)
    const max = Math.max(...chartData.map(d => d.doctors + d.nurses + d.managers));
    return (
        <div className="chart">
            <h3>Biểu đồ nhân sự theo tháng</h3>
            <div className="chart-bars">
                {chartData.map((d, idx) => {
                    const total = d.doctors + d.nurses + d.managers;
                    return (
                        <div className="chart-bar" key={d.month}>
                            <div className="bar" style={{ height: `${(total / max) * 120}px` }}>
                                <span className="bar-label">{total}</span>
                            </div>
                            <div className="month-label">{d.month}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Settings() {
    return (
        <div className="settings-panel">
            <h3>Cài đặt hệ thống</h3>
            <form>
                <label>
                    Email nhận thông báo:
                    <input type="email" placeholder="manager@hivcare.com" />
                </label>
                <label>
                    Ngôn ngữ:
                    <select>
                        <option>Tiếng Việt</option>
                        <option>English</option>
                    </select>
                </label>
                <button type="submit">Lưu thay đổi</button>
            </form>
        </div>
    );
}

export default function ManagerDashboard() {
    const [selected, setSelected] = useState(0);
    return (
        <div className="manager-dashboard">
            <Sidebar onSelect={setSelected} selected={selected} />
            <div className="dashboard-main">
                <Header />
                <div className="dashboard-content">
                    {selected === 0 && (
                        <>
                            <StatCards />
                            <Chart />
                            <NotificationPanel />
                        </>
                    )}
                    {selected === 1 && <DataTable />}
                    {selected === 2 && <Chart />}
                    {selected === 3 && <NotificationPanel />}
                    {selected === 4 && <Settings />}
                </div>
            </div>
        </div>
    );
}











































