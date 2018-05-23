package org.sxdata.jingwei.util.quartzUtil;

import org.apache.ibatis.session.SqlSession;
import org.sxdata.jingwei.entity.CarteInfoEntity;
import org.sxdata.jingwei.entity.SlaveEntity;
import org.sxdata.jingwei.util.CommonUtil.StringDateUtil;
import org.sxdata.jingwei.util.TaskUtil.CarteClient;
import org.sxdata.jingwei.util.TaskUtil.CarteStatusVo;
import org.sxdata.jingwei.util.TaskUtil.KettleEncr;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by cRAZY on 2017/3/17.
 */
public class SlaveQuota {

    //每隔N分钟采集节点指标的具体业务方法(已在配置文件中整合Spring会自动调用)
    public static void quotaSlaveInfoRepeat() throws Exception{
        SqlSession session=CarteClient.sessionFactory.openSession();
        List<CarteInfoEntity> carteInfoList=new ArrayList<CarteInfoEntity>();
        // 采集所有节点的信息
        List<SlaveEntity> slaves=session.selectList("org.sxdata.jingwei.dao.SlaveDao.getAllSlave","");
        String nDate= StringDateUtil.dateToString(new java.util.Date(), "yyyy-MM-dd HH:mm:ss");

        CarteStatusVo vo=null;
        CarteInfoEntity carteInfo=null;
        String carteStatus;
        for(SlaveEntity slave:slaves){
            slave.setPassword(KettleEncr.decryptPasswd(slave.getPassword()));
            CarteClient cc=new CarteClient(slave);

            carteStatus = cc.getStatusOrNull();
            if (carteStatus == null) continue;
            vo = CarteStatusVo.parseXml(carteStatus);
            //组装节点指标对象
            String hostInfo = cc.getSlaveHostInfo();
            String memFree = hostInfo.split("\\$")[0];
            String diskFree = hostInfo.split("\\$")[1];
            String cpuUsage = hostInfo.split("\\$")[2];
            carteInfo = new CarteInfoEntity(StringDateUtil.stringToDate(nDate,"yyyy-MM-dd HH:mm:ss"), cc.getSlave().getSlaveId(), vo.getThreadCount(), vo.getRunningJobNum(),
                    vo.getRunningTransNum(), (int) vo.getFreeMem(), (int) vo.getTotalMem(), vo.getFreeMemPercent(),
                    (float) vo.getLoadAvg(),null,null,memFree,cpuUsage,diskFree);
            carteInfoList.add(carteInfo);
        }
        //把采集到的所有节点的当前指标信息更新到数据表中
        Integer result=0;
        for(CarteInfoEntity carteInfoEntity:carteInfoList){
             result+=session.insert("org.sxdata.jingwei.dao.CarteInfoDao.insertCarteInfo", carteInfoEntity);
        }
        session.commit();
        System.out.println("定时采集节点指标信息成功!共更新→" + result + "条数据");
        session.close();
    }
}
