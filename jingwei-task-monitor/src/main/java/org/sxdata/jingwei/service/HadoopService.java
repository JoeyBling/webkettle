package org.sxdata.jingwei.service;

import org.pentaho.big.data.impl.cluster.NamedClusterImpl;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * Created by cRAZY on 2017/6/15.
 */
public interface HadoopService {
    public String addHadoopCluster(NamedClusterImpl cluster) throws Exception;

    public List<NamedClusterImpl> getAllCluster();

    public NamedClusterImpl getCluster(String name);

    public void deleteCluster(String clusterName);

    public Integer getEleIdByClusterName(String clusterName);

    public String updateHadoopCluster(HttpServletRequest request) throws Exception;
}
