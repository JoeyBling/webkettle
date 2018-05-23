package org.sxdata.jingwei.service;

import org.sxdata.jingwei.bean.PageforBean;
import org.sxdata.jingwei.entity.SlaveEntity;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * Created by cRAZY on 2017/2/28.
 */
public interface SlaveService {
    public Integer getAllSlaveSize();

    public List<SlaveEntity> getAllSlave(String userGroupName) throws Exception;

    public SlaveEntity getSlaveByLoadAvg(List<SlaveEntity> slaves) throws Exception;

    public PageforBean findSlaveByPageInfo(Integer start,Integer limit,String userGroupName) throws Exception;

    public void deleteSlave(Integer slaveId) throws Exception;

    public String slaveTest(String hostName) throws Exception;

    public String allSlaveQuato(String userGroupName) throws Exception;

    public String slaveQuatoByCondition(String quatoType,String viewType,String maxOrAvg,String chooseDate,String userGroupName) throws Exception;

    public String slaveQuatoLineChart(String quatoType,String maxOrAvg,String chooseDate,String userGroupName) throws Exception;

    public String slaveQuatoColumnDiagram(String quatoType,String maxOrAvg,String chooseDate,String userGroupName) throws Exception;

    public String slaveQuatoHTMLText(String quatoType,String maxOrAvg,String chooseDate,String userGroupName) throws Exception;

    public String addSlave(HttpServletRequest request) throws Exception;

    public SlaveEntity getSlaveByHostName(Integer id) throws Exception;

    public String updateSlave(HttpServletRequest request) throws Exception;
}
