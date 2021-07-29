package com.demo.card.api.impl;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

import com.demo.card.api.CardAPI;
import com.demo.card.api.utils.HttpUtil;
import com.demo.card.api.utils.TokenUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class BaiduCardImpl implements CardAPI {
    private static String APP_KEY = "xjWAoihISj9hXzigerWLGPeL";
    private static String APP_SECRET_KEY = "1MqR6ty5I53PnbqFDoHFcH3lNZk7DhBw";
    private static String API_URL = "https://aip.baidubce.com/rest/2.0/ocr/v1/business_card";

    private static final Logger log = LoggerFactory.getLogger(BaiduCardImpl.class);
    
    public BaiduCardImpl() {

    }
    
    public String recognition(String base64Pic) {
		log.info(base64Pic);
		// 注意这里仅为了简化编码每一次请求都去获取access_token，线上环境access_token有过期时间， 客户端可自行缓存，过期后重新获取。
        String accessToken = TokenUtil.getAuth(APP_KEY, APP_SECRET_KEY); //"[调用鉴权接口获取的token]";
        String imgParam = "";
		try {
			imgParam = URLEncoder.encode(base64Pic, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
        String param = "image=" + imgParam;
        log.info(param);
        String result = "";
		try {
			result = HttpUtil.post(API_URL, accessToken, param);
		} catch (Exception e) {
			e.printStackTrace();
		}
        System.out.println(result);
        return result;
	}
}