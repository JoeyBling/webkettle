package org.sxdata.jingwei.service.Impl;

import net.sf.json.JSONObject;
import org.flhy.ext.App;
import org.pentaho.di.core.Const;
import org.pentaho.di.repository.ObjectId;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositoryDirectoryInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.sxdata.jingwei.bean.PageforBean;
import org.sxdata.jingwei.dao.*;
import org.sxdata.jingwei.entity.*;
import org.sxdata.jingwei.service.TransService;
import org.sxdata.jingwei.util.TaskUtil.CarteClient;
import org.sxdata.jingwei.util.TaskUtil.CarteTaskManager;
import org.sxdata.jingwei.util.TaskUtil.KettleEncr;
import org.sxdata.jingwei.util.CommonUtil.StringDateUtil;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by cRAZY on 2017/2/22.
 */
@Service
public class TransServiceImpl implements TransService {
    @Autowired
    protected TransDao transDao;
    @Autowired
    protected SlaveDao slaveDao;
    @Autowired
    protected UserDao userDao;
    @Autowired
    protected TaskGroupDao taskGroupDao;

    @Autowired
    private DirectoryDao directoryDao;
    protected SimpleDateFormat format =  new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    @Override
    public List<TransformationEntity> getTransPath(List<TransformationEntity> items) throws Exception{
        List<TransformationEntity> result=new ArrayList<TransformationEntity>();
        for (TransformationEntity tran:items){
            String directoryName="";
            Integer directoryId=tran.getDirectoryId();
            //判断该作业是否是在根目录下 如果对应的目录id为0代表在根目录/下面
            if(directoryId==0){
                directoryName="/"+tran.getName();
            }else{
                //不是在根目录下,获取作业所在当前目录的目录名  并且拼接上作业名
                DirectoryEntity directory=directoryDao.getDirectoryById(directoryId);
                directoryName=directory.getDirectoryName()+"/"+tran.getName();
                Integer parentId=directory.getParentDirectoryId();
                //继续判断该文件上一级的目录是否是根目录
                if (parentId==0){
                    directoryName="/"+directoryName;
                }else{
                    //循环判断该目录的父级目录是否是根目录 直到根部为止
                    while(parentId!=0){
                        DirectoryEntity parentDirectory=directoryDao.getDirectoryById(parentId);
                        directoryName=parentDirectory.getDirectoryName()+"/"+directoryName;
                        parentId=parentDirectory.getParentDirectoryId();
                    }
                    directoryName="/"+directoryName;
                }

            }
            tran.setDirectoryName(directoryName);
            result.add(tran);
        }
        return result;
    }

    @Override
    public JSONObject findTrans(int start, int limit, String transName, String createDate,String userGroupName) throws Exception{

        //创建分页对象以及需要返回客户端的数据
        net.sf.json.JSONObject result=null;
        PageforBean pages=new PageforBean();
        Integer totalCount=0;
        List<TransformationEntity> trans=null;

        //如果传递的日期以及转换名参数都为空则代表是无条件查询,否则根据条件查询
        if(StringDateUtil.isEmpty(createDate) && StringDateUtil.isEmpty(transName)){
           trans=transDao.getThisPageTrans(start, limit,userGroupName);
            //对日期进行处理转换成指定的格式
            for (TransformationEntity transformation:trans){
                transformation.setCreateDate(format.parse(format.format(transformation.getCreateDate())));
                transformation.setModifiedDate(format.parse(format.format(transformation.getModifiedDate())));
            }
            //获取总记录数、该页的记录,并且封装成分页对象
            totalCount=transDao.getTotalSize(userGroupName);
        }else{
            if(!createDate.isEmpty()){
                createDate+=" 00:00:00";
            }
            trans=transDao.conditionFindTrans(start,limit,transName,createDate,userGroupName);
            for (TransformationEntity transformation:trans){
                transformation.setCreateDate(format.parse(format.format(transformation.getCreateDate())));
                transformation.setModifiedDate(format.parse(format.format(transformation.getModifiedDate())));
            }
           totalCount=transDao.conditionFindTransCount(transName,createDate,userGroupName);

        }
        //根据转换的id来查找该作业在资源库的绝对目录
       trans=getTransPath(trans);

        //设置每个转换所在的任务组(多个以逗号分隔)
        for(TransformationEntity tran:trans){
            List<TaskGroupAttributeEntity> items=taskGroupDao.getTaskGroupByTaskName(tran.getName(), "trans");
            if(null!=items && items.size()>0){
                if(items.size()==1){
                    tran.setBelongToTaskGroup(items.get(0).getTaskGroupName());
                }else{
                    String belongToTaskGroup="";
                    for(int i=0;i<items.size();i++){
                        if(i==items.size()-1){
                            belongToTaskGroup+=items.get(i).getTaskGroupName();
                            continue;
                        }
                        belongToTaskGroup+=items.get(i).getTaskGroupName()+",";
                    }
                    tran.setBelongToTaskGroup(belongToTaskGroup);
                }
            }
        }

        pages.setRoot(trans);
        pages.setTotalProperty(totalCount);
        result=net.sf.json.JSONObject.fromObject(pages, StringDateUtil.configJson("yyyy-MM-dd HH:mm:ss"));
        return result;
    }

    @Override
    public void deleteTransformation(String transPath,String flag) throws Exception {
        Repository repository = App.getInstance().getRepository();
        String dir = transPath.substring(0, transPath.lastIndexOf("/"));
        String name = transPath.substring(transPath.lastIndexOf("/") + 1);
        //删除转换在任务组明细中的记录
        taskGroupDao.deleteTaskGroupAttributesByTaskName(name,"trans");
        //删除转换
        RepositoryDirectoryInterface directory = repository.findDirectory(dir);
        if(directory == null)
            directory = repository.getUserHomeDirectory();
        ObjectId id = repository.getTransformationID(name, directory);
        repository.deleteTransformation(id);
    }

    @Override
    public void executeTransformation(String path,Integer slaveId) throws Exception {
        //获取用户信息
        UserEntity loginUser=userDao.getUserbyName("admin").get(0);
        loginUser.setPassword(KettleEncr.decryptPasswd("Encrypted " + loginUser.getPassword()));
        //构造Carte对象
        SlaveEntity slave=slaveDao.getSlaveById(slaveId);
        slave.setPassword(KettleEncr.decryptPasswd(slave.getPassword()));
        CarteClient carteClient=new CarteClient(slave);
        //拼接资源库名
        String repoId=CarteClient.hostName+"_"+CarteClient.databaseName;
        //拼接http请求字符串
        String urlString="/?rep="+repoId+"&user="+loginUser.getLogin()+"&pass="+loginUser.getPassword()+"&trans="+path+"&level=Basic";
        urlString = Const.replace(urlString, "/", "%2F");
        urlString = carteClient.getHttpUrl() + CarteClient.EXECREMOTE_TRANS +urlString;
        System.out.println("请求远程节点的url字符串为"+urlString);
        CarteTaskManager.addTask(carteClient, "trans_exec", urlString);
    }

    @Override
    public TransformationEntity getTransByName(String transName) throws Exception{
        TransformationEntity entity=transDao.getTransByName(transName);
        List<TransformationEntity> items=new ArrayList<TransformationEntity>();
        items.add(entity);
        return this.getTransPath(items).get(0);
    }

    @Override
    public boolean updateTransName(String oldName, String newName) {
        //修改转换名前首先判断新的转换名是否存在
        List<TransformationEntity> items=taskGroupDao.getAllTrans("");
        for(TransformationEntity item:items){
            if(item.getName().equals(oldName))
                continue;
            if(item.getName().equals(newName))
                return false;
        }
        taskGroupDao.updateTaskNameforAttr(oldName,newName,"trans","/"+newName);
        transDao.updateTransNameforTrans(oldName,newName);
        return true;
    }
}
