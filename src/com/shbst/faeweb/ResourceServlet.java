package com.shbst.faeweb;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;

@WebServlet(name = "ResourceServlet")
public class ResourceServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/javascript;charset=utf-8");
        response.setCharacterEncoding("UTF-8");
        Reader reader= request.getReader();
        String str =  ((BufferedReader) reader).readLine();
        str = new String(str.getBytes("ISO-8859-1"),"UTF-8");
        System.out.println("read line :"+str);

        JSONObject result = new JSONObject();
        try {
            JSONObject obj = JSON.parseObject(str);
            if( obj.getString("cmd").equals("add")){
                JSONArray array = loadResourceFile();
                Date now=new Date();
                SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
                obj.put("date",f.format(now));
                array.add(obj);
                saveResourceFile(array);
                result.put("success",1);
            }else if(obj.getString("cmd").equals("delete")){
                JSONArray array = loadResourceFile();
                for (int i=0;i < array.size();i ++){
                    JSONObject item = array.getJSONObject(i);
                    if (item.getString("url").equals(obj.getString("url"))){
                        array.remove(item);
                        break;
                    }
                }
                saveResourceFile(array);
                result.put("success",1);

            }else if(obj.getString("cmd").equals("query")){
                result.put("success",1);

                JSONArray array = loadResourceFile();
                Collections.sort(array, new JSONCompare());
                result.put("data", array);
                result.put("sort","sort by type");
            }else if(obj.getString("cmd").equals("addErrorInfo")){
                JSONArray array =  loadErrorFile();
                Date now=new Date();
                SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                obj.put("date",f.format(now));
                array.add(obj);
                saveErrorFile(array);

            }else if(obj.getString("cmd").equals("deleteErrorInfo")){

                JSONArray array = loadErrorFile();
                for (int i=0;i < array.size();i ++){
                    JSONObject item = array.getJSONObject(i);
                    if (item.getString("date").equals(obj.getString("date"))){
                        array.remove(item);
                        break;
                    }
                }
                saveErrorFile(array);
                result.put("success",1);
            }else if(obj.getString("cmd").equals("queryError")){
                result.put("success",1);
                result.put("data", loadErrorFile());
            }

        }catch (Exception e){
            e.printStackTrace();
        }

        response.getWriter().write(result.toJSONString());

    }



    class JSONCompare implements Comparator<Object>{
        @Override
        public int compare(Object o1, Object o2) {
            JSONObject j1 = (JSONObject)o1 ;
            JSONObject j2 = (JSONObject)o2 ;
            String key = j1.getString("type");
            String key2 = j2.getString("type");
            if (key.equals("ota")){
                key = "ato";
            }
            if (key2.equals("ota")){
                key2 = "ato";
            }
            if (key.equals(key2)){
                key = j1.getString("date");
                key2 = j2.getString("date");
            }else{
                return key.compareTo(key2);
            }

        }
    }
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        doPost(request,response);

    }

    private JSONArray loadResourceFile(){
        try{

            File file = new File("resource.json");
            if (file.exists() == false){
                file.createNewFile();
            }
            System.out.println("file patha :"+file.getAbsolutePath());
            FileInputStream inputStream = new FileInputStream(file);
            byte data[] = new byte[1024*500];
            int len = inputStream.read(data);
            if (len >0){
                inputStream.close();
                return JSON.parseArray(new String(data,0,len));
            }
            inputStream.close();
        }catch (Exception e){
            e.printStackTrace();
        }

        return new JSONArray();
    }

    private void saveResourceFile(JSONArray array){
        try{
            FileOutputStream outputStream = new FileOutputStream("resource.json");
            outputStream.write(array.toJSONString().getBytes());
            outputStream.close();
        }catch (Exception e){
            e.printStackTrace();
        }
    }

    private JSONArray loadErrorFile(){
        try{

            File file = new File("error.json");
            if (file.exists() == false){
                file.createNewFile();
            }
            System.out.println("file patha :"+file.getAbsolutePath());
            FileInputStream inputStream = new FileInputStream(file);
            byte data[] = new byte[1024*500];
            int len = inputStream.read(data);
            if (len >0){
                inputStream.close();
                return JSON.parseArray(new String(data,0,len));
            }
            inputStream.close();
        }catch (Exception e){
            e.printStackTrace();
        }

        return new JSONArray();
    }

    private void saveErrorFile(JSONArray array){
        try{
            FileOutputStream outputStream = new FileOutputStream("error.json");
            outputStream.write(array.toJSONString().getBytes());
            outputStream.close();
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}
