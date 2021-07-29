package com.demo.card.controllers;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

import com.demo.card.api.CardAPI;
import com.demo.card.api.impl.BaiduCardImpl;
import com.demo.card.models.HelloWorldResponse;
import com.sap.cloud.sdk.cloudplatform.connectivity.DefaultDestination;
import com.sap.cloud.sdk.cloudplatform.connectivity.Destination;
import com.sap.cloud.sdk.cloudplatform.connectivity.DestinationAccessor;
import com.sap.cloud.sdk.cloudplatform.connectivity.DestinationOptions;
import com.sap.cloud.sdk.cloudplatform.connectivity.DestinationProperties;
import com.sap.cloud.sdk.cloudplatform.connectivity.EnvVarDestinationLoader;
import com.sap.cloud.sdk.cloudplatform.connectivity.HttpClientAccessor;
import com.sap.cloud.sdk.cloudplatform.connectivity.HttpDestination;

@RestController
@RequestMapping( "/card" )
public class CardController
{
    private static final Logger logger = LoggerFactory.getLogger(CardController.class);
    private static final String DESTINATION_CARD = "BAIDUOCR";
    private static final String DESTINATION_CARD2 = "BAIDUOCR_2";

     @RequestMapping( value="/recognition", method = RequestMethod.POST )
    public String recognition(@RequestBody String image )
    {
        logger.info("I am running - test!");

        CardAPI api = new BaiduCardImpl();
        return api.recognition(image);
    }

    @RequestMapping( value="/test/ocr1", method = RequestMethod.GET )
    public ResponseEntity<String> testWithDestination( @RequestParam( defaultValue = "" ) final String image )
    {
        logger.info("I am running - test!");

        HttpDestination httpDest = DestinationAccessor.getDestination(DESTINATION_CARD).asHttp();
        
        HttpClient client = HttpClientAccessor.getHttpClient(httpDest);
        HttpPost httpPost = new HttpPost("/business_card");
        List<NameValuePair> parameters = new ArrayList<NameValuePair>(0);
        parameters.add(new BasicNameValuePair("image", image));
        UrlEncodedFormEntity formEntity = null;
        try {
            formEntity = new UrlEncodedFormEntity(parameters);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        httpPost.setEntity(formEntity);
        HttpResponse response = null;
        try {
            response = client.execute(httpPost);
            System.out.println("response.getStatusLine().getStatusCode()=" + response.getStatusLine().getStatusCode());
            if (response.getStatusLine().getStatusCode() == 200) {
                String content = EntityUtils.toString(response.getEntity(), "UTF-8");
                return ResponseEntity.ok(content);
            }
        } catch (ClientProtocolException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            // if (response != null) {
            //     response.close
            // }
            // client.close();
        }
        return ResponseEntity.ok("error");
        
    }

    @RequestMapping( value="/test/ocr2", method = RequestMethod.POST )
    public String testWithoutDestination(final String image )
    {
        logger.info("I am running - test!");

        CardAPI api = new BaiduCardImpl();
        return api.recognition(image);
        
        // EnvVarDestinationLoader loader = new EnvVarDestinationLoader();
        // Try<DefaultDestination> dd = loader.loadTypedDestination(DESTINATION_CARD, DestinationOptions.builder().build());
        // logger.info("destination --->" + dd.get().toString());
        
        // Try<Destination> d = loader.tryGetDestination(DESTINATION_CARD);

        // Try<Destination> tryDest = DestinationAccessor.tryGetDestination(DESTINATION_CARD);
        // if (tryDest.isFailure()) 
        // {
        //     logger.error(tryDest.getCause().toString());
        // }
        
        // Destination httpDest = tryDest.get();

        // DestinationProperties dp = null;

        // Destination httpDest = DestinationAccessor.getDestination(DESTINATION_CARD); //.asHttp();
        // httpDest.getPropertyNames().forEach(key  -> logger.info(key + "--->" + httpDest.get(key).get().toString()));
        
        // HttpClient client = HttpClientAccessor.getHttpClient(httpDest);
        // HttpPost httpPost = new HttpPost("/business_card");
        // List<NameValuePair> parameters = new ArrayList<NameValuePair>(0);
        // parameters.add(new BasicNameValuePair("image", img));
        // // parameters.add(new BasicNameValuePair("q", "java"));
        // UrlEncodedFormEntity formEntity = null;
        // try {
        //     formEntity = new UrlEncodedFormEntity(parameters);
        // } catch (UnsupportedEncodingException e) {
        //     e.printStackTrace();
        // }
        // httpPost.setEntity(formEntity);
        // HttpResponse response = null;
        // try {
        //     response = client.execute(httpPost);
        //     System.out.println("response.getStatusLine().getStatusCode()=" + response.getStatusLine().getStatusCode());
        //     if (response.getStatusLine().getStatusCode() == 200) {
        //         String content = EntityUtils.toString(response.getEntity(), "UTF-8");
        //         return ResponseEntity.ok(new HelloWorldResponse(content));
        //     }
            
        // } catch (ClientProtocolException e) {
        //     e.printStackTrace();
        // } catch (IOException e) {
        //     e.printStackTrace();
        // } finally {
        //     // if (response != null) {
        //     //     response.close
        //     // }
        //     // client.close();
        // }
        // return ResponseEntity.ok(new HelloWorldResponse("error"));
        
    }

    @RequestMapping( value="/test/ocr3", method = RequestMethod.POST )
    public ResponseEntity<HelloWorldResponse> testWithDestination2(final String img )
    {
        logger.info("I am running - test!");

        HttpDestination httpDest = DestinationAccessor.getDestination(DESTINATION_CARD2).asHttp();
        httpDest.getPropertyNames().forEach(key  -> {
             if (httpDest.get(key).isEmpty() ) {
                System.out.println(key + " =======is empty ") ;
             } else {
                System.out.println(key + "--->" + httpDest.get(key).get().toString());
             }
        });

        HttpClient client = HttpClientAccessor.getHttpClient(httpDest);
        HttpPost httpPost = new HttpPost("/business_card");
        
        List<NameValuePair> parameters = new ArrayList<NameValuePair>(0);
        parameters.add(new BasicNameValuePair("image", img));
        // parameters.add(new BasicNameValuePair("q", "java"));
        UrlEncodedFormEntity formEntity = null;
        try {
            formEntity = new UrlEncodedFormEntity(parameters);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        httpPost.setEntity(formEntity);
        HttpResponse response = null;
        try {
            response = client.execute(httpPost);
            System.out.println("response.getStatusLine().getStatusCode()=" + response.getStatusLine().getStatusCode());
            if (response.getStatusLine().getStatusCode() == 200) {
                String content = EntityUtils.toString(response.getEntity(), "UTF-8");
                return ResponseEntity.ok(new HelloWorldResponse(content));
            }
            
        } catch (ClientProtocolException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            // if (response != null) {
            //     response.close
            // }
            // client.close();
        }
        return ResponseEntity.ok(new HelloWorldResponse("error"));
    }
}
