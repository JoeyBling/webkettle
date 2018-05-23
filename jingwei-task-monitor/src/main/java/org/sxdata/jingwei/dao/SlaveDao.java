package org.sxdata.jingwei.dao;

import org.springframework.stereotype.Repository;
import org.sxdata.jingwei.entity.SlaveEntity;

import java.util.List;

/**
 * Created by cRAZY on 2017/2/28.
 */
@Repository
public interface SlaveDao {

    public Integer getSlaveTotalCount();

    public SlaveEntity getSlaveById(Integer id);

    public List<SlaveEntity> getAllSlave(String userGroupName);

    public SlaveEntity getSlaveByHostName(String hostName);

    public List<SlaveEntity> findSlaveByPageInfo(Integer start,Integer limit,String userGroupName);

    public void addSlave(SlaveEntity slave);

    public Integer selectMaxId();

    public void deleteTransSlave(Integer slaveId);

    public void deleteSlaveUserGroup(Integer slaveId);

    public void deleteSlaveServer(Integer slaveId);

    public void updateSlaveServer(SlaveEntity slave);
}
