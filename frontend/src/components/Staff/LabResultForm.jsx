import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LabResultForm.scss';
import { toast } from 'react-toastify';

const createNewResultRow = (patientId, testTypes = [], testTypeId = '') => {
    const selectedTestType = testTypes.find(t => t.id.toString() === testTypeId) || (testTypes.length > 0 ? testTypes[0] : null);
    const currentTestTypeId = testTypeId || (selectedTestType ? selectedTestType.id.toString() : '');

    return {
        key: Math.random(),
        patientId: patientId,
        testTypeId: currentTestTypeId,
        testTypeName: selectedTestType ? selectedTestType.name : '',
        testDate: new Date().toISOString().split('T')[0],
        resultValue: '',
        unit: selectedTestType ? selectedTestType.unit : '',
        normalRange: selectedTestType ? selectedTestType.normalRange : '',
        notes: '',
        price: selectedTestType ? selectedTestType.price : 0,
    };
};

const LabResultForm = ({ labRequest, appointment, onClose, onSubmitSuccess }) => {
    const [results, setResults] = useState([]);
    const [commonTestDate, setCommonTestDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingTestTypes, setLoadingTestTypes] = useState(false);
    const [testTypes, setTestTypes] = useState([]);

    const isPredefinedRequest = !!labRequest;
    const patientInfo = labRequest || appointment;

    useEffect(() => {
        const fetchTestTypes = async () => {
            try {
                setLoadingTestTypes(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    'http://localhost:8080/api/lab-test-types',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTestTypes(response.data);
            } catch (error) {
                console.error('Error fetching test types:', error);
                toast.error('Không thể tải danh sách loại xét nghiệm');
            } finally {
                setLoadingTestTypes(false);
            }
        };

        fetchTestTypes();
    }, []);

    useEffect(() => {
        if (isPredefinedRequest && labRequest && labRequest.id) {
            const fetchLabRequestItems = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(
                        `http://localhost:8080/api/lab-requests/${labRequest.id}/items`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    const items = response.data.map(item => {
                        const testType = testTypes.find(t => t.id === item.testTypeId);
                        return {
                            key: item.id,
                            labRequestItemId: item.id,
                            patientId: labRequest.patientId,
                            testTypeId: item.testTypeId.toString(),
                            testTypeName: item.testTypeName,
                            resultValue: item.resultValue || '',
                            unit: testType ? testType.unit : '',
                            normalRange: testType ? testType.normalRange : '',
                            notes: item.notes || '',
                        };
                    });
                    setResults(items);
                } catch (error) {
                    console.error('Error fetching lab request items:', error);
                    toast.error('Không thể tải thông tin yêu cầu xét nghiệm');
                }
            };

            fetchLabRequestItems();
        } else if (!isPredefinedRequest) {
            setResults([createNewResultRow(appointment.patientId, testTypes)]);
        }
    }, [isPredefinedRequest, labRequest, testTypes]);

    const handleResultChange = (index, field, value) => {
        const newResults = [...results];
        newResults[index][field] = value;

        if (field === 'testTypeId') {
            const selectedTestType = testTypes.find(test => test.id.toString() === value);
            if (selectedTestType) {
                newResults[index].unit = selectedTestType.unit;
                newResults[index].normalRange = selectedTestType.normalRange;
                newResults[index].price = selectedTestType.price;
                newResults[index].testTypeName = selectedTestType.name;
                newResults[index].resultValue = '';
            }
        }

        setResults(newResults);
    };

    const addResultRow = () => {
        setResults([...results, createNewResultRow(appointment.patientId, testTypes)]);
    };

    const removeResultRow = (index) => {
        setResults(results.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        // Logic cập nhật kết quả xét nghiệm cho từng item đã tồn tại
        if (isPredefinedRequest) {
            const requests = results.map(result => {
                const dataToSubmit = {
                    resultValue: result.resultValue,
                    resultDate: commonTestDate,
                    notes: result.notes,
                };
                // Gọi API cập nhật item xét nghiệm
                return axios.put(`http://localhost:8080/api/lab-requests/items/${result.labRequestItemId}`, dataToSubmit, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            });
            try {
                await Promise.all(requests);
                // Cập nhật trạng thái lab request thành COMPLETED
                await axios.patch(`http://localhost:8080/api/lab-requests/${labRequest.id}/status`, null, {
                    params: { status: 'COMPLETED' },
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Cập nhật tất cả kết quả thành công!');
                onSubmitSuccess();
            } catch (err) {
                setError('Lỗi khi cập nhật kết quả.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        } else {
            // Logic to create new lab results from scratch
            const requests = results.map(result => {
                const dataToSubmit = {
                    patientId: result.patientId,
                    testTypeId: parseInt(result.testTypeId, 10),
                    testDate: commonTestDate,
                    resultValue: result.resultValue,
                    notes: result.notes,
                };
                // This API might need to be created or adjusted
                return axios.post('http://localhost:8080/api/lab-results', dataToSubmit, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            });
            try {
                await Promise.all(requests);
                toast.success('Thêm tất cả kết quả thành công!');
                onSubmitSuccess();
            } catch (err) {
                setError('Có lỗi xảy ra khi thêm một hoặc nhiều kết quả.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    if (loadingTestTypes) {
        return (
            <div className="form-overlay">
                <div className="form-container"><p>Đang tải...</p></div>
            </div>
        );
    }

    if (!patientInfo) {
        return (
            <div className="form-overlay">
                <div className="form-container">
                    <p>Không có thông tin yêu cầu hoặc cuộc hẹn.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="form-overlay">
            <div className="form-container">
                <h2>Thêm kết quả xét nghiệm cho: {patientInfo.patientName}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Ngày xét nghiệm (chung cho tất cả)</label>
                        <input type="date" value={commonTestDate} onChange={e => setCommonTestDate(e.target.value)} required />
                    </div>

                    <hr />

                    {results.map((result, index) => (
                        <div key={result.key} className="result-row">
                            {!isPredefinedRequest && results.length > 1 && (
                                <button type="button" onClick={() => removeResultRow(index)} className="btn-remove-row">Xóa</button>
                            )}
                            <h4>{isPredefinedRequest ? result.testTypeName : `Xét nghiệm #${index + 1}`}</h4>

                            {!isPredefinedRequest && (
                                <div className="form-group">
                                    <label>Loại xét nghiệm</label>
                                    <select value={result.testTypeId} onChange={e => handleResultChange(index, 'testTypeId', e.target.value)} required>
                                        <option value="">-- Chọn loại xét nghiệm --</option>
                                        {testTypes.map(testType => (
                                            <option key={testType.id} value={testType.id.toString()}>
                                                {testType.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Kết quả</label>
                                <input
                                    type="text"
                                    value={result.resultValue || ''}
                                    onChange={e => handleResultChange(index, 'resultValue', e.target.value)}
                                    placeholder="Bổ sung kết quả xét nghiệm"
                                    className="result-input"
                                />
                            </div>

                            <div className="form-group-inline">
                                <div className="form-group">
                                    <label>Đơn vị</label>
                                    <input type="text" value={result.unit} readOnly />
                                </div>
                                <div className="form-group">
                                    <label>Giới hạn bình thường</label>
                                    <input type="text" value={result.normalRange} readOnly />
                                </div>
                                {!isPredefinedRequest && (
                                    <div className="form-group">
                                        <label>Giá (VNĐ)</label>
                                        <input type="text" value={result.price ? result.price.toLocaleString('vi-VN') : '0'} readOnly />
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea value={result.notes} onChange={e => handleResultChange(index, 'notes', e.target.value)}></textarea>
                            </div>
                        </div>
                    ))}

                    {!isPredefinedRequest && (
                        <button type="button" onClick={addResultRow} className="btn-add-row">
                            + Thêm xét nghiệm khác
                        </button>
                    )}

                    {error && <p className="error-message">{error}</p>}

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Hủy</button>
                        <button type="submit" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LabResultForm; 