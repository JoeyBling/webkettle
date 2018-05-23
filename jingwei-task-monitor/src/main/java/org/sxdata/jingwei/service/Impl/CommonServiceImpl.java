package org.sxdata.jingwei.service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.sxdata.jingwei.dao.CommonDao;
import org.sxdata.jingwei.entity.DatabaseConnEntity;
import org.sxdata.jingwei.service.CommonService;

import java.util.List;

/**
 * Created by cRAZY on 2017/6/1.
 */
@Service
public class CommonServiceImpl implements CommonService{
    @Autowired
    protected CommonDao cDao;

    @Override
    public List<DatabaseConnEntity> getDatabases() {
        return cDao.getDababasesConn();
    }

    @Override
    public void deleteDatabaseConn(Integer id) {
        cDao.deleteDatabaseAttr(id);
        cDao.deleteDatabaseMeta(id);
        cDao.deleteJobDatabase(id);
        cDao.deleteTransDatabase(id);
    }
}
