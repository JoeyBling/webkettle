package org.sxdata.jingwei.dao;

import org.pentaho.big.data.impl.cluster.NamedClusterImpl;
import org.springframework.stereotype.Repository;
import org.sxdata.jingwei.entity.JobEntity;
import org.sxdata.jingwei.entity.SlaveEntity;

import java.util.List;
import java.util.Map;

/**
 * Created by cRAZY on 2017/6/15.
 */
@Repository
public interface HadoopClusterDao {
    public void addCluster(Integer attrId,Integer elementId,Integer attrParId,String attrKey,String attrValue);

    public List<NamedClusterImpl> allCluster();

    public NamedClusterImpl getClusterByName(String clusterName);

    public List<SlaveEntity> getClusters();

    public void addClusterEle(Map<String,Object> map);

    public Integer getNextId(String tableName,String field);

    public void deleteEle(Integer elementId);

    public void deleteEleAttr(Integer elementId);

    public Integer getEleIdByClusterName(String clusterName);

    public void updateEle(Map<String,Object> element);

    public void updateEleAttr(Map<String,Object> eleAttr);
}
