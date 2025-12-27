
package com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.config;

import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Random;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 *
 * @author CTT VNPAY
 */
@Component
public class VnPayConfig {

    // URL thanh toán VNPay (môi trường sandbox)
    public static String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    // URL trả về sau khi thanh toán (điểm cuối API)
    public static String vnp_ReturnUrl = "http://localhost:8080/api/payments/vnpay/return";
//    public static String vnp_ReturnUrl = "https://1234-5678.ngrok.io/api/payments/vnpay/return";
    // Mã TmnCode của VNPay (thay bằng mã thực tế của bạn)
    public static String vnp_TmnCode = "4SDLAN8Q";
    // Khóa bí mật của VNPay (thay bằng khóa thực tế của bạn)
    public static String secretKey = "OCCKGK4M9XPIMIFALYYYIVY5NN4RCC6D";
    // URL API của VNPay (môi trường sandbox)
    public static String vnp_ApiUrl = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

    public static String md5(String message) {
        String digest = null;
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(message.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                sb.append(String.format("%02x", b & 0xff));
            }
            digest = sb.toString();
        } catch (UnsupportedEncodingException ex) {
            digest = "";
        } catch (NoSuchAlgorithmException ex) {
            digest = "";
        }
        return digest;
    }

    public static String Sha256(String message) {
        String digest = null;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(message.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                sb.append(String.format("%02x", b & 0xff));
            }
            digest = sb.toString();
        } catch (UnsupportedEncodingException ex) {
            digest = "";
        } catch (NoSuchAlgorithmException ex) {
            digest = "";
        }
        return digest;
    }

//    //Util for VNPAY
//    public static String hashAllFields(Map fields) {
//        List fieldNames = new ArrayList(fields.keySet());
//        Collections.sort(fieldNames);
//        StringBuilder sb = new StringBuilder();
//        Iterator itr = fieldNames.iterator();
//        while (itr.hasNext()) {
//            String fieldName = (String) itr.next();
//            String fieldValue = (String) fields.get(fieldName);
//            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
//                sb.append(fieldName);
//                sb.append("=");
//                sb.append(fieldValue);
//            }
//            if (itr.hasNext()) {
//                sb.append("&");
//            }
//        }
//        return hmacSHA512(secretKey,sb.toString());
//    }
//
//    public static String hmacSHA512(final String key, final String data) {
//        try {
//            if (key == null || data == null) {
//                throw new NullPointerException("Khóa hoặc dữ liệu không được để trống");
//            }
//            final Mac hmac512 = Mac.getInstance("HmacSHA512");
//            byte[] hmacKeyBytes = key.getBytes();
//            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
//            hmac512.init(secretKey);
//            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
//            byte[] result = hmac512.doFinal(dataBytes);
//            StringBuilder sb = new StringBuilder(2 * result.length);
//            for (byte b : result) {
//                sb.append(String.format("%02x", b & 0xff));
//            }
//            return sb.toString();
//
//        } catch (Exception ex) {
//            throw new RuntimeException("Lỗi khi tạo mã băm HMAC SHA512", ex);
//        }
//    }



//    //Util for VNPAY
//    public static String hashAllFields(Map<String, String> fields) {
//        List fieldNames = new ArrayList(fields.keySet());
//        Collections.sort(fieldNames);
//        StringBuilder sb = new StringBuilder();
//        Iterator itr = fieldNames.iterator();
//        while (itr.hasNext()) {
//            String fieldName = (String) itr.next();
//            String fieldValue = (String) fields.get(fieldName);
//            if ((fieldValue != null) && (fieldValue.length() > 0)) {
//                sb.append(fieldName);
//                sb.append("=");
//                sb.append(fieldValue);
//            }
//            if (itr.hasNext()) {
//                sb.append("&");
//            }
//        }
//        return hmacSHA512(secretKey,sb.toString());
//    }


    public static String hashAllFields(Map<String, String> fields) {
        // Không nên chỉnh trực tiếp map đầu vào
        Map<String, String> filteredFields = new java.util.HashMap<>(fields);
        filteredFields.remove("vnp_SecureHash");
        filteredFields.remove("vnp_SecureHashType");

        List<String> sortedKeys = new ArrayList<>(filteredFields.keySet());
        Collections.sort(sortedKeys);

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < sortedKeys.size(); i++) {
            String key = sortedKeys.get(i);
            String value = filteredFields.get(key);
            if (value != null && !value.isEmpty()) {
                sb.append(key)
                        .append("=")
                        .append(value); // KHÔNG encode khi tính hash
                if (i != sortedKeys.size() - 1) {
                    sb.append("&");
                }
            }
        }
        
        String hashData = sb.toString();
        System.out.println("=== Hash Debug ===");
        System.out.println("Secret Key: " + secretKey);
        System.out.println("Hash Input: " + hashData);
        String result = hmacSHA512(secretKey, hashData);
        System.out.println("Hash Output: " + result);
        System.out.println("=== End Hash Debug ===");
        
        return result;
    }


    public static String hmacSHA512(final String key, final String data) {
        try {

            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();

        } catch (Exception ex) {
            return "Lỗi khi tạo chữ ký HMAC-SHA512";
        }
    }
//    public String hashAllFields(Map<String, String> fields) {
//        List<String> fieldNames = new ArrayList<>(fields.keySet());
//        Collections.sort(fieldNames);
//        StringBuilder sb = new StringBuilder();
//        for (String fieldName : fieldNames) {
//            String fieldValue = fields.get(fieldName);
//            if (fieldValue != null && !fieldValue.isEmpty() && !fieldName.equals("vnp_SecureHash")) {
//                sb.append(fieldName).append("=").append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
//                if (fieldNames.indexOf(fieldName) < fieldNames.size() - 1) {
//                    sb.append("&");
//                }
//            }
//        }
//        return hmacSHA512(secretKey, sb.toString());
//    }

//    private String hmacSHA512(String key, String data) {
//        try {
//            Mac sha512Hmac = Mac.getInstance("HmacSHA512");
//            SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
//            sha512Hmac.init(keySpec);
//            byte[] hmacData = sha512Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
//            StringBuilder result = new StringBuilder();
//            for (byte b : hmacData) {
//                result.append(String.format("%02x", b));
//            }
//            return result.toString();
//        } catch (Exception e) {
//            throw new RuntimeException("Lỗi khi tạo chữ ký HMAC-SHA512", e);
//        }
//    }
    /**
     * Lấy địa chỉ IP của client từ ngữ cảnh yêu cầu HTTP.
     * @return Địa chỉ IP của client hoặc thông báo lỗi nếu không lấy được.
     */
    public static String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                String ipAddress = attributes.getRequest().getHeader("X-FORWARDED-FOR");
                if (ipAddress == null || ipAddress.isEmpty()) {
                    ipAddress = attributes.getRequest().getRemoteAddr();
                }
                // Fix IPv6 localhost issue
                if ("0:0:0:0:0:0:0:1".equals(ipAddress) || "::1".equals(ipAddress)) {
                    ipAddress = "127.0.0.1";
                }
                return ipAddress;
            }
            return "127.0.0.1";
        } catch (Exception e) {
            return "127.0.0.1";
        }
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
