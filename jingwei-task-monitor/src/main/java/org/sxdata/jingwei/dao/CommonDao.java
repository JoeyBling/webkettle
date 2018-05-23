package org.sxdata.jingwei.dao;

import org.springframework.stereotype.Repository;
import org.sxdata.jingwei.entity.DatabaseConnEntity;
import org.sxdata.jingwei.entity.SlaveEntity;

import java.util.List;

/**
 * Created by cRAZY on 2017/5/31.
 */
@Repository
public interface CommonDao {
    public List<DatabaseConnEntity> getDababasesConn();

    public void deleteDatabaseAttr(Integer id);

    public void deleteDatabaseMeta(Integer id);

    public void deleteJobDatabase(Integer id);

    public void deleteTransDatabase(Integer id);
}
