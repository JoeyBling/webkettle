package org.sxdata.jingwei.dao;

import org.springframework.stereotype.Repository;
import org.sxdata.jingwei.entity.CarteInfoEntity;

import java.util.List;

/**
 * Created by cRAZY on 2017/3/17.
 */
@Repository
public interface CarteInfoDao {
    public void insertCarteInfo(CarteInfoEntity carteInfo);

    public List<CarteInfoEntity> getAllSlaveQuato(String minDate,String maxDate);

    public List<CarteInfoEntity> getSlaveQuatoBySlaveId(String minDate,String maxDate,Integer slaveId);

    public List<CarteInfoEntity> slaveQuatoByAvg(String minDate,String maxDate,Integer slaveId);

    public List<CarteInfoEntity> slaveQuatoByMax(String minDate,String maxDate,Integer slaveId);
}
