package org.sxdata.jingwei.util.TaskUtil;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.dbcp.BasicDataSource;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.message.BasicHeader;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.defaults.DefaultSqlSessionFactory;
import org.pentaho.di.core.Const;
import org.pentaho.di.www.*;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.sxdata.jingwei.entity.SlaveEntity;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * Created by cRAZY on 2017/2/28.
 */
public class CarteClient implements ApplicationContextAware {
    private String httpUrl;
    private Header authorization;
    private SlaveEntity slave;
    public static String databaseName;  //数据库名
    public static String hostName;  //资源库ip
    public static DefaultSqlSessionFactory sessionFactory;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
            BasicDataSource dataSource=(BasicDataSource)applicationContext.getBean("dataSource");
            sessionFactory=(DefaultSqlSessionFactory)applicationContext.getBean("sqlSessionFactory");
            String url=dataSource.getUrl();
            int a=url.lastIndexOf("/");
            databaseName=url.substring(a+1,url.length());
            int c=url.indexOf("/");
            int d=url.lastIndexOf(":");
            hostName=url.substring(c+2,d);

        try{
            //开启作业定时
            CarteTaskManager.startJobTimeTask(sessionFactory);
        }catch (Exception e){
            e.printStackTrace();
        }
    }


    public final static String URL_SUF = "?xml=Y";
    /**Kettle carte服务 servlet引用地址(统一收集于此处)*/
    public final static String CARTE_STATUS = GetStatusServlet.CONTEXT_PATH;
    public final static String SLAVE_STATUS = "/kettle/slaveMonitor";
    public final static String TRANS_STATUS = GetTransStatusServlet.CONTEXT_PATH;
    public final static String JOB_STATUS = GetJobStatusServlet.CONTEXT_PATH;
    public final static String RUN_JOB = RunJobServlet.CONTEXT_PATH;
    public final static String EXECREMOTE_JOB = ExecuteJobServlet.CONTEXT_PATH;
    public final static String EXECREMOTE_TRANS = ExecuteTransServlet.CONTEXT_PATH;
    public final static String STOP_TRANS = StopTransServlet.CONTEXT_PATH;
    public final static String STOP_JOB = StopJobServlet.CONTEXT_PATH;
    public final static String REMOVE_TRANS = RemoveTransServlet.CONTEXT_PATH;
    public final static String REMOVE_JOB = RemoveJobServlet.CONTEXT_PATH;
    public final static String PAUSE_TRANS = PauseTransServlet.CONTEXT_PATH;

    public CarteClient(SlaveEntity slave) {
        this.httpUrl = "http://" + slave.getHostName() + ":" + slave.getPort();
        this.authorization = new BasicHeader("Authorization", "Basic " +
                Base64.encodeBase64String((slave.getUsername() + ":" + slave.getPassword()).getBytes()));
        setSlave(slave);
    }

    public boolean isDBActive(){
        boolean dbflag = false;
        try {
            String dbStatus = getDBStatus();
            dbflag = dbStatus.contains("Unable to connect to repository:");
        } catch (Exception e) {
            e.printStackTrace();
            dbflag = true;
        }
        return dbflag;
    }
    public boolean isActive() {
        boolean flag = false;
        try {
            String status = getStatus();
            flag = status.startsWith("<?xml version");
        } catch (Exception e) {
            e.printStackTrace();
            flag = false;
        }
        return flag;
    }

    public String getSlaveHostInfo() throws Exception {
        String urlString = httpUrl + SLAVE_STATUS;
        return doGet(urlString);
    }

    public String getJobLogText(String jobCarteId) throws Exception {
        return SlaveServerJobStatus.fromXML(getJobStatus(jobCarteId)).getLoggingString();
    }

    public String getJobStatus(String jobId) throws Exception {
        String urlString = httpUrl + JOB_STATUS + "?xml=Y&id=" + jobId;
        return doGet(urlString);
    }

    public String getDBStatus() throws Exception {
        String urlString = httpUrl + CARTE_STATUS;
        return doGet(urlString);
    }

    public String getTransLogText(String transCarteId) throws Exception {
        return SlaveServerTransStatus.fromXML(getTransStatus(transCarteId)).getLoggingString();
    }

    public String stopTrans(String transId) throws Exception {
        String urlString = httpUrl + STOP_TRANS + "/?" + "xml=Y&id=" + transId;
        return doGet(urlString);
    }

    /*
	暂停某个转换
	 */
    public String pauseTrans(String transId) throws Exception {
        if (SlaveServerTransStatus.fromXML(getTransStatus(transId)).isRunning() || SlaveServerTransStatus.fromXML(getTransStatus(transId)).isPaused()) {
            String urlString = httpUrl + PAUSE_TRANS + "/?" + "xml=Y&id=" + transId;
            return doGet(urlString);
        } else {
            return "the trans is not running.";
        }
    }

    public String stopJob(String jobId) throws Exception {
        String urlString = httpUrl + STOP_JOB + "/?" + "xml=Y&id=" + jobId;
        return doGet(urlString);
    }

    public String getTransStatus(String transId) throws Exception {
        String urlString = httpUrl + TRANS_STATUS + "?xml=Y&id=" + transId;
        return doGet(urlString);
    }

    public String getStatusOrNull(){
        boolean flag = false;
        String status = null;
        try {
            status = getStatus();
            flag = status.startsWith("<?xml version");
        } catch (Exception e) {
            System.err.println("[ERROR]===> 节点: " + this.getSlave().getHostName() + ":" + this.getSlave().getPort() + " 连接异常!");
            flag = false;
        }
        return flag ? status : null;
    }



    public  String doGet(String urlString) throws IOException {
        urlString = Const.replace(urlString, " ", "%20");
        HttpGet httpGet = new HttpGet(urlString);
        if (this.authorization != null) {
            httpGet.addHeader(authorization);
        }
        HttpClient client = HttpClientUtil.getHttpClient();
        HttpResponse response = client.execute(httpGet);
        String result = "";
        if (response.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
            HttpEntity entity = response.getEntity();
            InputStream content = entity.getContent();
            InputStreamReader in = new InputStreamReader(content);
            BufferedReader br = new BufferedReader(in);
            String line;
            while ((line = br.readLine()) != null) {
                result += line;
            }
            if (br != null) br.close();
            if (in != null) in.close();
            if (content != null) content.close();
        }
        return result;
    }

    public String getTransStatus(String transName, String transId) throws Exception {
        String urlString = httpUrl + TRANS_STATUS + "?xml=Y&id=" + transId + "&name=" + transName;
        return doGet(urlString);
    }

    public String getJobStatus(String jobName, String jobId) throws Exception {
        String urlString = httpUrl + JOB_STATUS + "?xml=Y&id=" + jobId + "&name=" + jobName;
        return doGet(urlString);
    }

    public String getStatus() throws Exception {
        String urlString = httpUrl + CARTE_STATUS + URL_SUF;
        return doGet(urlString);
    }

    public CarteClient() {

    }

    public String getHttpUrl() {
        return httpUrl;
    }

    public Header getAuthorization() {
        return authorization;
    }

    public SlaveEntity getSlave() {
        return slave;
    }

    public void setHttpUrl(String httpUrl) {
        this.httpUrl = httpUrl;
    }

    public void setSlave(SlaveEntity slave) {
        this.slave = slave;
    }

    public void setAuthorization(Header authorization) {
        this.authorization = authorization;
    }
}
