package org.sxdata.jingwei.service.Impl;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.flhy.ext.App;
import org.flhy.ext.trans.steps.SystemInfo;
import org.pentaho.di.core.encryption.Encr;
import org.pentaho.di.repository.LongObjectId;
import org.pentaho.di.repository.ObjectId;
import org.pentaho.di.repository.kdr.KettleDatabaseRepository;
import org.pentaho.di.repository.kdr.delegates.KettleDatabaseRepositoryBaseDelegate;
import org.pentaho.di.repository.kdr.delegates.KettleDatabaseRepositorySlaveServerDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.sxdata.jingwei.bean.PageforBean;
import org.sxdata.jingwei.dao.CarteInfoDao;
import org.sxdata.jingwei.dao.SlaveDao;
import org.sxdata.jingwei.dao.UserGroupDao;
import org.sxdata.jingwei.entity.CarteInfoEntity;
import org.sxdata.jingwei.entity.SlaveUserRelationEntity;
import org.sxdata.jingwei.entity.UserGroupAttributeEntity;
import org.sxdata.jingwei.service.SlaveService;
import org.sxdata.jingwei.util.CommonUtil.StringDateUtil;
import org.sxdata.jingwei.util.TaskUtil.CarteClient;
import org.sxdata.jingwei.util.TaskUtil.CarteStatusVo;
import org.sxdata.jingwei.entity.SlaveEntity;
import org.sxdata.jingwei.util.TaskUtil.KettleEncr;

import javax.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

/**
 * Created by cRAZY on 2017/2/28.
 */
@Service
public class SlaveServiceImpl implements SlaveService {
    @Autowired
    protected SlaveDao slaveDao;
    @Autowired
    protected CarteInfoDao carteInfoDao;
    @Autowired
    protected UserGroupDao userGroupDao;

    @Override
    public Integer getAllSlaveSize() {
        return slaveDao.getAllSlave("").size();
    }

    public String[] getXvalue(List<CarteInfoEntity> items) throws Exception{
        String[] xValue=new String[items.size()];
        for(int i=0;i<items.size();i++){
            CarteInfoEntity item=items.get(i);
            String xHour=item.getxHour();
            xValue[i]=xHour+"点";
        }
        return xValue;
    }

    public String[] getXvalue(List<CarteInfoEntity> items,String flag) throws Exception{
        String[] xValue=new String[items.size()];
        for(int i=0;i<items.size();i++){
            CarteInfoEntity item=items.get(i);
            String nDate=StringDateUtil.dateToString(item.getnDate(),"yyyy-MM-dd HH:mm:ss");
            nDate=nDate.substring(11,16);
            xValue[i]=nDate;
        }
        return xValue;
    }

    @Override
    //获取所有节点的所有指标信息(某个时间段,默认3个小时内的)
    public String allSlaveQuato(String userGroupName) throws Exception {
        List<SlaveEntity> slaves=slaveDao.getAllSlave(userGroupName);
        JSONObject result=new JSONObject();
        //负载
        JSONObject loadAvg=new JSONObject();
        //CPU
        JSONObject cpuUsage=new JSONObject();
        //线程数
        JSONObject threadNum=new JSONObject();
        //内存
        JSONObject freeMem=new JSONObject();
        //设置起始和结束的时间段
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, calendar.get(Calendar.HOUR_OF_DAY) - 3);
        String minDate= StringDateUtil.dateToString(calendar.getTime(), "yyyy-MM-dd HH:mm:ss");
        String maxDate=StringDateUtil.dateToString(new Date(), "yyyy-MM-dd HH:mm:ss");
        //X轴时间坐标 四个折线图通用
        JSONObject xValue=new JSONObject();
        xValue.put("type","category");
        xValue.put("boundaryGap",false);
        //折线图顶部的节点hostName名 四个折线图通用
        String[] legend=new String[slaves.size()];
        //渲染负载折线图
        JSONArray loadAvgDataArray=new JSONArray();
        JSONObject loadAvgYValue=new JSONObject();
        loadAvgYValue.put("type","value");
        loadAvgYValue.put("min",0);
        float maxLoadAvg=0;
        //渲染线程数折线图
        JSONArray threadNumDataArray=new JSONArray();
        JSONObject threadNumYValue=new JSONObject();
        threadNumYValue.put("type", "value");
        threadNumYValue.put("min",0);
        Integer maxThreadNum=0;
        //渲染CPU使用率折线图
        JSONArray cpuUsageDataArray=new JSONArray();
        JSONObject cpuUsageYValue=new JSONObject();
        cpuUsageYValue.put("type", "value");
        cpuUsageYValue.put("min",0);
        double maxCpuUsage=0.0;
        //渲染空闲内存折线图
        JSONArray freeMemDataArray=new JSONArray();
        JSONObject freeMemYValue=new JSONObject();
        freeMemYValue.put("type", "value");
        freeMemYValue.put("min",0);
        Integer maxFreeMem=0;

        for(int i1=0;i1<slaves.size();i1++){
            SlaveEntity slave=slaves.get(i1);
            List<CarteInfoEntity> items=carteInfoDao.getSlaveQuatoBySlaveId(minDate, maxDate, slave.getSlaveId());
            //折线图X轴内容及参数
            if(i1==0){
                xValue.put("data",this.getXvalue(items,""));
            }
            //折线图的顶部 文字描述
            legend[i1]=slave.getHostName();
            //获取折线每个点的取值
            float[] loadAvgs=new float[items.size()];
            int[] threadNums=new int[items.size()];
            double [] cpuUsages=new double[items.size()];
            int[] freeMems=new int[items.size()];

            for(int j1=0;j1<items.size();j1++){
                CarteInfoEntity item=items.get(j1);
                loadAvgs[j1]=item.getLoadAvg();
                threadNums[j1]=item.getThreadNum();
                Double cpuUsageValue=Double.valueOf(item.getHostCpuUsage().trim().substring(0,item.getHostCpuUsage().trim().length()-1));
                cpuUsages[j1]=cpuUsageValue;
                int hostFreeMem=Integer.valueOf(item.getHostFreeMem().trim().substring(0,item.getHostFreeMem().trim().length()-2));
                freeMems[j1]=hostFreeMem/1024;
            }
            //获取每个折线图Y轴所需要的最大值
            float thisSlaveMaxLoadAvg=StringDateUtil.getMaxValueByFloatArray(loadAvgs);
            Integer thisSlaveMaxThreadNum=StringDateUtil.getMaxValueByIntArray(threadNums);
            double thisSlaveMaxCpuUsage=StringDateUtil.getMaxValueBydoubleArray(cpuUsages);
            Integer thisSlaveMaxFreeMem=StringDateUtil.getMaxValueByIntArray(freeMems);
            if(maxCpuUsage<thisSlaveMaxCpuUsage)
                maxCpuUsage=thisSlaveMaxCpuUsage;
            if(maxFreeMem<thisSlaveMaxFreeMem)
                maxFreeMem=thisSlaveMaxFreeMem;
            if (maxLoadAvg<thisSlaveMaxLoadAvg)
                maxLoadAvg=thisSlaveMaxLoadAvg;
            if (maxThreadNum<thisSlaveMaxThreadNum)
                maxThreadNum=thisSlaveMaxThreadNum;

            //负载折线图数据
            JSONObject loadAvgData=new JSONObject();
            loadAvgData.put("name",slave.getHostName());
            loadAvgData.put("type","line");
            loadAvgData.put("data",loadAvgs);
            loadAvgDataArray.add(loadAvgData);
            //线程数折线图数据
            JSONObject threadNumData=new JSONObject();
            threadNumData.put("name",slave.getHostName());
            threadNumData.put("type","line");
            threadNumData.put("data", threadNums);
            threadNumDataArray.add(threadNumData);
            //CPU使用率折线图数据
            JSONObject cpuUsageData=new JSONObject();
            cpuUsageData.put("name",slave.getHostName());
            cpuUsageData.put("type","line");
            cpuUsageData.put("data", cpuUsages);
            cpuUsageDataArray.add(cpuUsageData);
            //空闲内存折线图数据和Y轴
            JSONObject freeMemData=new JSONObject();
            freeMemData.put("name",slave.getHostName());
            freeMemData.put("type","line");
            freeMemData.put("data", freeMems);
            freeMemDataArray.add(freeMemData);
        }
        //负载Y轴最大值
        if(maxLoadAvg<=5){
            loadAvgYValue.put("max",5);
        }else if(maxLoadAvg<=10){
            loadAvgYValue.put("max",10);
        }else if(maxLoadAvg<=20){
            loadAvgYValue.put("max",20);
        }else{
            loadAvgYValue.put("max",40);
        }
        //线程数Y轴最大值
        if(maxThreadNum<=100){
            threadNumYValue.put("max",100);
        }else if(maxThreadNum<=200){
            threadNumYValue.put("max",200);
        }else if(maxThreadNum<=500){
            threadNumYValue.put("max",500);
        }else{
            threadNumYValue.put("max",1000);
        }
        //cpu使用率Y轴最大值
        if(maxCpuUsage<=1.0){
            cpuUsageYValue.put("max",1.0);
        }else if(maxCpuUsage<=2.0){
            cpuUsageYValue.put("max",2.0);
        }else if(maxCpuUsage<=5.0){
            cpuUsageYValue.put("max",5.0);
        }else if(maxCpuUsage<=10.0){
            cpuUsageYValue.put("max",10.0);
        }else if(maxCpuUsage<=20.0){
            cpuUsageYValue.put("max",20.0);
        }else{
            cpuUsageYValue.put("max",50.0);
        }
        JSONObject cpuAxisLable=new JSONObject();
        cpuAxisLable.put("formatter","{value} %");
        cpuUsageYValue.put("axisLabel",cpuAxisLable);
        //空闲内存Y轴最大值
        if(maxFreeMem<=1000){
            freeMemYValue.put("max",1000);
        }else if(maxFreeMem<2000){
            freeMemYValue.put("max",2000);
        }else if(maxFreeMem<5000){
            freeMemYValue.put("max",5000);
        }else{
            freeMemYValue.put("max",10000);
        }
        JSONObject freeMemAxisLable=new JSONObject();
        freeMemAxisLable.put("formatter","{value} MB");
        freeMemYValue.put("axisLabel",freeMemAxisLable);
        //负载
        loadAvg.put("Y",loadAvgYValue);
        loadAvg.put("X",xValue);
        loadAvg.put("series",loadAvgDataArray);
        loadAvg.put("legend",legend);
        //线程数
        threadNum.put("legend",legend);
        threadNum.put("X",xValue);
        threadNum.put("series",threadNumDataArray);
        threadNum.put("Y",threadNumYValue);
        //cpu使用率
        cpuUsage.put("legend",legend);
        cpuUsage.put("X",xValue);
        cpuUsage.put("series",cpuUsageDataArray);
        cpuUsage.put("Y",cpuUsageYValue);
        //空闲内存
        freeMem.put("legend",legend);
        freeMem.put("X",xValue);
        freeMem.put("series",freeMemDataArray);
        freeMem.put("Y",freeMemYValue);
        //四个折线图组装的json
        result.put("loadAvg",loadAvg);
        result.put("threadNum",threadNum);
        result.put("cpuUsage",cpuUsage);
        result.put("freeMem",freeMem);
        return result.toString();
    }

    @Override
    //所有节点某个指标信息的折线图
    public String slaveQuatoLineChart(String quatoType,String maxOrAvg,String chooseDate,String userGroupName) throws Exception {
        List<SlaveEntity> slaves=slaveDao.getAllSlave(userGroupName);
        if(null==slaves || slaves.size()<1)
            return null;
       /* try{
            slaves=setLoadAvgAndStatus(slaves);
        }catch (Exception e){
            e.printStackTrace();
        }*/
        JSONObject result=new JSONObject();
        //设置需要获取指标信息的起止时间段
        if(null==chooseDate || chooseDate==""){
            chooseDate=StringDateUtil.dateToString(new Date(),"yyyy-MM-dd HH:mm:ss");
            chooseDate=chooseDate.substring(0,10);
        }else{
            chooseDate=chooseDate.substring(0,10);
        }
        String minDate= chooseDate+" 00:00:00";
        String maxDate= chooseDate+" 23:59:59";

        //X轴 时间坐标 任何指标项通用
        JSONObject xValue=new JSONObject();
        xValue.put("type","category");
        xValue.put("boundaryGap",false);
        //折线图顶部的节点hostName名 任何指标通用
        String[] legend=new String[slaves.size()];
        for(int i=0;i<slaves.size();i++){
            SlaveEntity slave=slaves.get(i);
            List<CarteInfoEntity> items=new ArrayList<CarteInfoEntity>();
            if(maxOrAvg.equals("最大值")){
                items=carteInfoDao.slaveQuatoByMax(minDate,maxDate,slave.getSlaveId());
            }else{
                items=carteInfoDao.slaveQuatoByAvg(minDate, maxDate, slave.getSlaveId());
            }
            if(i==0){
                xValue.put("data",this.getXvalue(items));
            }
            //折线图的顶部 文字描述
            legend[i]=slave.getHostName();
        }

        //折线图Y轴以及所有折线内容的集合
        JSONObject yValue=new JSONObject();
        yValue.put("type", "value");
        yValue.put("min", 0);
        JSONArray series=new JSONArray();
        if(quatoType.equals("负载指数")){
            float maxLoadAvg=0;
            for(int i1=0;i1<slaves.size();i1++){
                SlaveEntity slave=slaves.get(i1);
                List<CarteInfoEntity> items=new ArrayList<CarteInfoEntity>();
                if(maxOrAvg.equals("最大值")){
                    items=carteInfoDao.slaveQuatoByMax(minDate,maxDate,slave.getSlaveId());
                }else{
                   items=carteInfoDao.slaveQuatoByAvg(minDate, maxDate, slave.getSlaveId());
                }
                float[] loadAvgs=new float[items.size()];
                for(int j1=0;j1<items.size();j1++){
                    CarteInfoEntity item=items.get(j1);
                    loadAvgs[j1]=item.getLoadAvg();
                }
                float thisSlaveMax=StringDateUtil.getMaxValueByFloatArray(loadAvgs);
                if(thisSlaveMax>maxLoadAvg)
                    maxLoadAvg=thisSlaveMax;
                //负载折线图Y轴和数据
                JSONObject loadAvgData=new JSONObject();
                loadAvgData.put("name",slave.getHostName());
                loadAvgData.put("type","line");
                loadAvgData.put("data",loadAvgs);
                series.add(loadAvgData);
            }
            if(maxLoadAvg<=5){
                yValue.put("max",5);
            }else if(maxLoadAvg<=10){
                yValue.put("max",10);
            }else if(maxLoadAvg<=20){
                yValue.put("max",20);
            }else{
                yValue.put("max",40);
            }
        }else if(quatoType.equals("CPU利用率")){
            Double maxCpuUsage=0.0;
            for(int i1=0;i1<slaves.size();i1++){
                SlaveEntity slave=slaves.get(i1);
                List<CarteInfoEntity> items=new ArrayList<CarteInfoEntity>();
                if(maxOrAvg.equals("最大值")){
                    items=carteInfoDao.slaveQuatoByMax(minDate,maxDate,slave.getSlaveId());
                }else{
                    items=carteInfoDao.slaveQuatoByAvg(minDate, maxDate, slave.getSlaveId());
                }
                double [] cpuUsages=new double[items.size()];
                for(int j1=0;j1<items.size();j1++){
                    CarteInfoEntity item=items.get(j1);
                    Double cpuUsageValue=Double.valueOf(item.getHostCpuUsage().trim().substring(0, item.getHostCpuUsage().trim().length() - 1));
                    cpuUsages[j1]=cpuUsageValue;
                }
                Double thisSlaveMax=StringDateUtil.getMaxValueBydoubleArray(cpuUsages);
                if(maxCpuUsage<thisSlaveMax){
                    maxCpuUsage=thisSlaveMax;
                }
                JSONObject cpuUsageData=new JSONObject();
                cpuUsageData.put("name",slave.getHostName());
                cpuUsageData.put("type", "line");
                cpuUsageData.put("data", cpuUsages);
                series.add(cpuUsageData);
            }
            if(maxCpuUsage<=1.0){
                yValue.put("max",1.0);
            }else if(maxCpuUsage<=2.0){
                yValue.put("max",2.0);
            }else if(maxCpuUsage<=5.0){
                yValue.put("max",5.0);
            }else if(maxCpuUsage<=10.0){
                yValue.put("max",10.0);
            }else if(maxCpuUsage<=20.0){
                yValue.put("max",20.0);
            }else{
                yValue.put("max",50.0);
            }
            JSONObject cpuAxisLable=new JSONObject();
            cpuAxisLable.put("formatter","{value} %");
            yValue.put("axisLabel",cpuAxisLable);
        }else if(quatoType.equals("空闲内存")){
            Integer maxFreeMem=0;
            for(int i1=0;i1<slaves.size();i1++){
                SlaveEntity slave=slaves.get(i1);
                List<CarteInfoEntity> items=new ArrayList<CarteInfoEntity>();
                if(maxOrAvg.equals("最大值")){
                    items=carteInfoDao.slaveQuatoByMax(minDate,maxDate,slave.getSlaveId());
                }else{
                    items=carteInfoDao.slaveQuatoByAvg(minDate, maxDate, slave.getSlaveId());
                }
                int[] freeMems=new int[items.size()];
                for(int j1=0;j1<items.size();j1++){
                    CarteInfoEntity item=items.get(j1);
                    int hostFreeMem=Integer.valueOf(item.getHostFreeMem());
                    freeMems[j1]=hostFreeMem/1024;
                }
                Integer thisSlaveMax=StringDateUtil.getMaxValueByIntArray(freeMems);
                if(thisSlaveMax>maxFreeMem){
                    maxFreeMem=thisSlaveMax;
                }
                JSONObject freeMemData=new JSONObject();
                freeMemData.put("name",slave.getHostName());
                freeMemData.put("type", "line");
                freeMemData.put("data", freeMems);
                series.add(freeMemData);
            }
            if(maxFreeMem<=1000){
                yValue.put("max",1000);
            }else if(maxFreeMem<2000){
                yValue.put("max",2000);
            }else if(maxFreeMem<5000){
                yValue.put("max",5000);
            }else{
                yValue.put("max",10000);
            }
            JSONObject freeMemAxisLable=new JSONObject();
            freeMemAxisLable.put("formatter","{value} MB");
            yValue.put("axisLabel",freeMemAxisLable);
        }else if(quatoType.equals("线程数")){
            Integer maxThreadNum=0;
            for(int i1=0;i1<slaves.size();i1++){
                SlaveEntity slave=slaves.get(i1);
                List<CarteInfoEntity> items=new ArrayList<CarteInfoEntity>();
                if(maxOrAvg.equals("最大值")){
                    items=carteInfoDao.slaveQuatoByMax(minDate,maxDate,slave.getSlaveId());
                }else{
                    items=carteInfoDao.slaveQuatoByAvg(minDate, maxDate, slave.getSlaveId());
                }
                int[] threadNums=new int[items.size()];
                for(int j1=0;j1<items.size();j1++){
                    CarteInfoEntity item=items.get(j1);
                    threadNums[j1]=item.getThreadNum();
                }
                Integer thisSlaveMax=StringDateUtil.getMaxValueByIntArray(threadNums);
                if(thisSlaveMax>maxThreadNum){
                    maxThreadNum=thisSlaveMax;
                }
                JSONObject threadNumData=new JSONObject();
                threadNumData.put("name",slave.getHostName());
                threadNumData.put("type", "line");
                threadNumData.put("data", threadNums);
                series.add(threadNumData);
            }
            if(maxThreadNum<=100){
                yValue.put("max",100);
            }else if(maxThreadNum<=200){
                yValue.put("max",200);
            }else if(maxThreadNum<=500){
                yValue.put("max",500);
            }else{
                yValue.put("max",1000);
            }
        }else if(quatoType.equals("空闲硬盘")){
            Integer maxFreeDisk=0;
            for(int i1=0;i1<slaves.size();i1++){
                SlaveEntity slave=slaves.get(i1);
                List<CarteInfoEntity> items=new ArrayList<CarteInfoEntity>();
                if(maxOrAvg.equals("最大值")){
                    items=carteInfoDao.slaveQuatoByMax(minDate,maxDate,slave.getSlaveId());
                }else{
                    items=carteInfoDao.slaveQuatoByAvg(minDate, maxDate, slave.getSlaveId());
                }
                int[] hostFreeDisks=new int[items.size()];
                for(int j1=0;j1<items.size();j1++){
                    CarteInfoEntity item=items.get(j1);
                    hostFreeDisks[j1]=Integer.valueOf(item.getHostFreeDisk());
                }
                Integer thisSlaveMax=StringDateUtil.getMaxValueByIntArray(hostFreeDisks);
                if(thisSlaveMax>maxFreeDisk){
                    maxFreeDisk=thisSlaveMax;
                }
                JSONObject freeDiskData=new JSONObject();
                freeDiskData.put("name",slave.getHostName());
                freeDiskData.put("type", "line");
                freeDiskData.put("data", hostFreeDisks);
                series.add(freeDiskData);
            }
            if(maxFreeDisk<=50){
                yValue.put("max",50);
            }else if(maxFreeDisk<=100){
                yValue.put("max",100);
            }else if(maxFreeDisk<=200){
                yValue.put("max",200);
            }else if(maxFreeDisk<=500){
                yValue.put("max",500);
            }else if(maxFreeDisk<=1000){
                yValue.put("max",1000);
            }else{
                yValue.put("max",2000);
            }
            JSONObject diskAxisLable=new JSONObject();
            diskAxisLable.put("formatter","{value} GB");
            yValue.put("axisLabel",diskAxisLable);
        }else if(quatoType.equals("作业数")){
            Integer maxJobNum=0;
            for(int i1=0;i1<slaves.size();i1++){
                SlaveEntity slave=slaves.get(i1);
                List<CarteInfoEntity> items=new ArrayList<CarteInfoEntity>();
                if(maxOrAvg.equals("最大值")){
                    items=carteInfoDao.slaveQuatoByMax(minDate,maxDate,slave.getSlaveId());
                }else{
                    items=carteInfoDao.slaveQuatoByAvg(minDate, maxDate, slave.getSlaveId());
                }
                int[] jobNums=new int[items.size()];
                for(int j1=0;j1<items.size();j1++){
                    CarteInfoEntity item=items.get(j1);
                    jobNums[j1]=item.getJobNum();
                }
                Integer thisSlaveMax=StringDateUtil.getMaxValueByIntArray(jobNums);
                if(thisSlaveMax>maxJobNum)
                    maxJobNum=thisSlaveMax;
                JSONObject jobNumData=new JSONObject();
                jobNumData.put("name",slave.getHostName());
                jobNumData.put("type","line");
                jobNumData.put("data", jobNums);
                series.add(jobNumData);
            }
            if(maxJobNum<10){
                yValue.put("max",10);
            }else if(maxJobNum<20){
                yValue.put("max",20);
            }else if(maxJobNum<50){
                yValue.put("max",50);
            }else if(maxJobNum<100){
                yValue.put("max",100);
            }else if(maxJobNum<500){
                yValue.put("max",500);
            }
        }else if(quatoType.equals("转换数")){
            Integer maxTransNum=0;
            for(int i1=0;i1<slaves.size();i1++){
                SlaveEntity slave=slaves.get(i1);
                List<CarteInfoEntity> items=new ArrayList<CarteInfoEntity>();
                if(maxOrAvg.equals("最大值")){
                    items=carteInfoDao.slaveQuatoByMax(minDate,maxDate,slave.getSlaveId());
                }else{
                    items=carteInfoDao.slaveQuatoByAvg(minDate, maxDate, slave.getSlaveId());
                }
                int[] transNums=new int[items.size()];
                for(int j1=0;j1<items.size();j1++){
                    CarteInfoEntity item=items.get(j1);
                    transNums[j1]=item.getTransNum();
                }
                Integer thisSlaveMax=StringDateUtil.getMaxValueByIntArray(transNums);
                if(thisSlaveMax>maxTransNum)
                    maxTransNum=thisSlaveMax;
                JSONObject transNumData=new JSONObject();
                transNumData.put("name",slave.getHostName());
                transNumData.put("type","line");
                transNumData.put("data", transNums);
                series.add(transNumData);
            }
            if(maxTransNum<10){
                yValue.put("max",10);
            }else if(maxTransNum<20){
                yValue.put("max",20);
            }else if(maxTransNum<50){
                yValue.put("max",50);
            }else if(maxTransNum<100){
                yValue.put("max",100);
            }else if(maxTransNum<500){
                yValue.put("max",500);
            }
        }
        result.put("X",xValue);
        result.put("legend",legend);
        result.put("Y",yValue);
        result.put("series",series);
        return result.toString();
    }

    @Override
    //所有节点某个指标信息的柱形图
    public String slaveQuatoColumnDiagram(String quatoType,String maxOrAvg,String chooseDate,String userGroupName) throws Exception {
        return null;
    }

    @Override
    //所有节点某个指标信息的文本
    public String slaveQuatoHTMLText(String quatoType,String maxOrAvg,String chooseDate,String userGroupName) throws Exception {
        return null;
    }

    @Override
    //获取所有节点的某个指标项信息
    //param1:节点的哪个指标   params2:视图类型     param3:显示平均值还是最大值
    public String slaveQuatoByCondition(String quatoType,String viewType,String maxOrAvg,String chooseDate,String userGroupName) throws Exception {
        String result=null;
        if(viewType.equals("折线图")){
            result=this.slaveQuatoLineChart(quatoType,maxOrAvg,chooseDate,userGroupName);
        }else if(viewType.equals("柱形图")){
            result=this.slaveQuatoColumnDiagram(quatoType,maxOrAvg,chooseDate,userGroupName);
        }else{
            result=this.slaveQuatoHTMLText(quatoType,maxOrAvg,chooseDate,userGroupName);
        }
        return result;
    }

    //设置节点的负载和状态
    public List<SlaveEntity> setLoadAvgAndStatus(List<SlaveEntity> slaves) throws Exception{
        List<SlaveEntity> result=new ArrayList<SlaveEntity>();
        for(SlaveEntity slave:slaves){
            //对取出的节点密码进行解码重新赋值
            slave.setPassword(KettleEncr.decryptPasswd(slave.getPassword()));
            //获取节点状态的相关信息
            CarteClient carteClient=new CarteClient(slave);
            String status=null;
            status=carteClient.getStatusOrNull();
            boolean dbActive=!carteClient.isDBActive();
            CarteStatusVo carteStatusVo = null;
            if (status != null) {
                if (dbActive) {
                    carteStatusVo = CarteStatusVo.parseXml(status);
                    //设置负载以及节点是否正常
                    slave.setLoadAvg(carteStatusVo.getLoadAvg());
                    slave.setStatus("<font color='green'>节点正常</font>");
                } else {
                    slave.setLoadAvg(0);
                    slave.setStatus("<font color='red'>该节点连接资源数据库异常</font>");
                }
            } else {
                slave.setLoadAvg(0);
                slave.setStatus("<font color='red'>节点异常</font>");
            }
            result.add(slave);
        }
        return result;
    }

    @Override
    //获取所有节点信息
    public List<SlaveEntity> getAllSlave(String userGroupName) throws Exception {
        List<SlaveEntity> slaves=slaveDao.getAllSlave(userGroupName);
        return this.setLoadAvgAndStatus(slaves);
    }

    @Override
    //选择一个负载指数最低的节点
    public SlaveEntity getSlaveByLoadAvg(List<SlaveEntity> slaves) throws Exception {
        SlaveEntity minSlave=null;
        List<SlaveEntity> errorSlaves=new ArrayList<SlaveEntity>();
        if(slaves!=null && slaves.size()>0){
            //获取不正常节点
            for(int i=0;i<slaves.size();i++){
                if (slaves.get(i).getLoadAvg()==0){
                    errorSlaves.add(slaves.get(i));
                }
            }
            //移除不正常节点
            for(SlaveEntity errorSlave:errorSlaves){
                slaves.remove(errorSlave);
            }
            //从正常节点中获取负载指数最低的节点
            if(slaves.size()==1){
                minSlave=slaves.get(0);
            }else if(slaves.size()>1){
                minSlave=slaves.get(0);
                for(int i=0;i<slaves.size();i++){
                    if (slaves.get(i).getLoadAvg()<minSlave.getLoadAvg()){
                        minSlave=slaves.get(i);
                    }
                }
            }
        }
        return minSlave;
    }

    @Override
    public PageforBean findSlaveByPageInfo(Integer start, Integer limit,String userGroupName) throws Exception {

        List<SlaveEntity> slaves=slaveDao.findSlaveByPageInfo(start,limit,userGroupName);
        //进一步获取节点的详细信息 运行的作业/转换数 在线时长等
        for(SlaveEntity slave:slaves){
            slave.setPassword(KettleEncr.decryptPasswd(slave.getPassword()));
            CarteClient cc=new CarteClient(slave);

            String status=null;
            CarteStatusVo vo=null;
            status=cc.getStatusOrNull();
            boolean dbActive=!cc.isDBActive();
            if(status!=null){
                //设置节点 运行中的作业/转换数 运行时间
                vo=CarteStatusVo.parseXml(status);
                slave.setRunningJobNum(vo.getRunningJobNum());
                slave.setRunningTransNum(vo.getRunningTransNum());
                slave.setUpTime(vo.getUpTime());
                //设置节点的状态以及负载
                if (dbActive) {
                    //设置负载以及节点是否正常
                    slave.setLoadAvg(vo.getLoadAvg());
                    slave.setStatus("<font color='green'>节点正常</font>");
                } else {
                    slave.setLoadAvg(0);
                    slave.setStatus("<font color='red'>该节点连接资源数据库异常</font>");
                }

                //TODO 已完成的作业/转换需要从日志表获取
               // slave.setFinishJobNum(XXXX);
                //slave.setFinishTransNum(XXX);
            }else{
                slave.setLoadAvg(0);
                slave.setStatus("<font color='red'>节点异常</font>");
            }
        }
        //获取总记录数
        Integer count=slaveDao.getSlaveTotalCount();
        PageforBean result=new PageforBean();
        result.setRoot(slaves);
        result.setTotalProperty(count);
        return result;
    }

    @Override
    public void deleteSlave(Integer slaveId) throws Exception {
       /* ObjectId objectId=new LongObjectId(slaveId);
        App.getInstance().getRepository().deleteSlave(objectId);*/
        slaveDao.deleteTransSlave(slaveId);
        slaveDao.deleteSlaveUserGroup(slaveId);
        slaveDao.deleteSlaveServer(slaveId);
    }



    @Override
    public String slaveTest(String hostName) throws Exception{
        JSONObject json=new JSONObject();
        SlaveEntity slave=slaveDao.getSlaveByHostName(hostName);
        slave.setPassword(KettleEncr.decryptPasswd(slave.getPassword()));
        CarteClient cc=new CarteClient(slave);
        boolean isActive=cc.isActive();
        int timeOut=3000;
        boolean slaveNetStatus= InetAddress.getByName(hostName).isReachable(timeOut);
        if(isActive){
            json.put("carteStatus","Y");
        }else{
            json.put("carteStatus","N");
        }
      /*  if(isdbActive){
            json.put("slaveRepo","Y");
        }else{
            json.put("slaveRepo","N");
        }*/
        if(slaveNetStatus){
            json.put("slaveNetwork","Y");
        }else{
            json.put("slaveNetwork","N");
        }
        String jarArray="";
        try {
            boolean isdbActive=!cc.isDBActive();
            String hostInfo=cc.getSlaveHostInfo();
            if(!StringDateUtil.isEmpty(hostInfo)){
                jarArray=hostInfo.split("\\$")[3];
            }
        }catch (Exception e){
        }
        json.put("slaveJarSupport",jarArray);
        return json.toString();
    }

    @Override
    public String addSlave(HttpServletRequest request) throws Exception{
        String result="Y";
        JSONObject json=JSONObject.fromObject(request.getParameter("slaveServer"));
        SlaveEntity slave=(SlaveEntity)JSONObject.toBean(json,SlaveEntity.class);
        slave.setPassword(KettleEncr.encryptPassword(slave.getPassword()));
        Integer id=slaveDao.selectMaxId();
        if(null==id)
            id=1;
        else
            id+=1;
        slave.setSlaveId(id);
        //判断是否存在相同的节点
        List<SlaveEntity> items=slaveDao.getAllSlave("");
        for(SlaveEntity item:items){
            if(item.getHostName().equals(slave.getHostName()) && item.getPort().equals(slave.getPort())){
                result="N";
                return result;
            }
        }
        slaveDao.addSlave(slave);
        //判断添加节点的是admin还是普通管理员
        Integer typeId=Integer.valueOf(request.getParameter("userType"));
        if(typeId==1){
            UserGroupAttributeEntity attr=(UserGroupAttributeEntity)request.getSession().getAttribute("userInfo");
            String userGroupName=attr.getUserGroupName();
            SlaveUserRelationEntity sr=new SlaveUserRelationEntity();
            sr.setSlaveId(id);
            sr.setUserGroupName(userGroupName);
            userGroupDao.addUserSlaveRelation(sr);
        }else{
            String[] userGroupNameArray=request.getParameterValues("userGroupArray");
            if(null!=userGroupNameArray && userGroupNameArray.length>0){
                for(String userGroupName:userGroupNameArray){
                    if(!StringDateUtil.isEmpty(userGroupName)){
                        SlaveUserRelationEntity sr=new SlaveUserRelationEntity();
                        sr.setSlaveId(id);
                        sr.setUserGroupName(userGroupName);
                        userGroupDao.addUserSlaveRelation(sr);
                    }
                }
            }
        }
        return result;
    }

    @Override
    public String updateSlave(HttpServletRequest request) throws Exception {
        String result="Y";
        JSONObject json=JSONObject.fromObject(request.getParameter("slaveServer"));
        SlaveEntity targetSlave=(SlaveEntity)JSONObject.toBean(json,SlaveEntity.class);
        targetSlave.setPassword(KettleEncr.encryptPassword(targetSlave.getPassword()));
        //判断是否存在相同节点
        List<SlaveEntity> items=slaveDao.getAllSlave("");
        for(SlaveEntity item:items){
            if(item.getSlaveId().toString().equals(targetSlave.getSlaveId().toString())){
                continue;
            }
            if(item.getHostName().equals(targetSlave.getHostName()) && item.getPort().equals(targetSlave.getPort())){
                result="N";
                return result;
            }
            if(item.getName().equals(targetSlave.getName())){
                result="N";
                return result;
            }
        }
        slaveDao.updateSlaveServer(targetSlave);
        return result;
    }

    @Override
    public SlaveEntity getSlaveByHostName(Integer id) throws Exception {
        return slaveDao.getSlaveById(id);
    }
}
