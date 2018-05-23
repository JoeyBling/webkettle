package org.flhy.webapp.repository.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.Enumeration;
import java.util.List;
import java.util.spi.TimeZoneNameProvider;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import org.apache.commons.io.IOUtils;
import org.apache.ibatis.session.SqlSession;
import org.flhy.ext.App;
import org.flhy.ext.PluginFactory;
import org.flhy.ext.base.GraphCodec;
import org.flhy.ext.cluster.SlaveServerCodec;
import org.flhy.ext.core.database.DatabaseCodec;
import org.flhy.ext.repository.RepositoryCodec;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.JsonUtils;
import org.flhy.ext.utils.StringEscapeHelper;
import org.flhy.webapp.bean.RepositoryCheckNode;
import org.flhy.webapp.bean.RepositoryNode;
import org.flhy.webapp.repository.beans.RepositoryNodeType;
import org.pentaho.di.cluster.SlaveServer;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.Props;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.core.exception.KettlePluginException;
import org.pentaho.di.core.exception.KettleSecurityException;
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.PluginTypeInterface;
import org.pentaho.di.core.plugins.RepositoryPluginType;
import org.pentaho.di.core.variables.Variables;
import org.pentaho.di.core.xml.XMLHandler;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.repository.ObjectId;
import org.pentaho.di.repository.RepositoriesMeta;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositoryDirectoryInterface;
import org.pentaho.di.repository.RepositoryElementMetaInterface;
import org.pentaho.di.repository.RepositoryMeta;
import org.pentaho.di.repository.RepositoryObjectType;
import org.pentaho.di.repository.kdr.KettleDatabaseRepositoryMeta;
import org.pentaho.di.trans.TransMeta;
import org.pentaho.di.ui.core.PropsUI;
import org.pentaho.di.ui.repository.kdr.KettleDatabaseRepositoryDialog;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.sxdata.jingwei.entity.TaskGroupAttributeEntity;
import org.sxdata.jingwei.util.CommonUtil.StringDateUtil;
import org.sxdata.jingwei.util.TaskUtil.CarteClient;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

@Controller
@RequestMapping(value = "/repository")
public class RepositoryController {

	/**
	 * 该方法返回所有的资源库信息
	 * @throws KettleException 
	 * @throws IOException 
	 */
	@RequestMapping(method = RequestMethod.POST, value = "/list")
	protected @ResponseBody List list() throws KettleException, IOException {
		RepositoriesMeta input = new RepositoriesMeta();
		ArrayList list = new ArrayList();
		if (input.readData()) {
			for (int i = 0; i < input.nrRepositories(); i++) {
				RepositoryMeta repositoryMeta = input.getRepository(i);
				list.add(RepositoryCodec.encode(repositoryMeta));
			}
		}
		return list;
	}
	
	/**
	 * 根据databaseName加载该数据库的所有配置信息
	 *
	 * @param name - 数据库标识
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/database")
	protected void database(@RequestParam String name) throws Exception {
		RepositoriesMeta input = new RepositoriesMeta();
		DatabaseMeta databaseMeta = null;
		if (input.readData()) {
			for (int i = 0; i < input.nrDatabases(); i++) {
				if(input.getDatabase(i).getName().equals(name)) {
					databaseMeta = input.getDatabase(i);
					break;
				}
			}
		}
		
		if(databaseMeta == null)
			databaseMeta = new DatabaseMeta();
		
		JSONObject jsonObject = DatabaseCodec.encode(databaseMeta);
		JsonUtils.response(jsonObject);
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/createDir")
	protected void createDir(@RequestParam String dir, @RequestParam String name) throws KettleException, IOException {
		Repository repository = App.getInstance().getRepository();
		RepositoryDirectoryInterface path = repository.findDirectory(dir);
		if(path == null)
			path = repository.getUserHomeDirectory();
		RepositoryDirectoryInterface newdir = repository.createRepositoryDirectory(path, name.trim());
		JsonUtils.success(newdir.getPath());
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/createTrans")
	protected void createTrans(@RequestParam String dir, @RequestParam String transName,@RequestParam String[] taskGroupArray) throws KettleException, IOException {
		boolean isSuccess=false;
		Repository repository = App.getInstance().getRepository();
		RepositoryDirectoryInterface directory = null;
		TransMeta transMeta = null;
		SqlSession sqlSession=CarteClient.sessionFactory.openSession();
		try {
			directory = repository.findDirectory(dir);
			if(directory == null)
				directory = repository.getUserHomeDirectory();
			if(repository.exists(transName, directory, RepositoryObjectType.TRANSFORMATION)) {
				JsonUtils.fail("该转换已经存在，请重新输入！");
				return;
			}
			transMeta = new TransMeta();
			transMeta.setRepository(App.getInstance().getRepository());
			transMeta.setMetaStore(App.getInstance().getMetaStore());
			transMeta.setName(transName);
			transMeta.setRepositoryDirectory(directory);
			repository.save(transMeta, "add: " + new Date(), null);
			isSuccess=true;
			//添加任务组记录
			if(null!=taskGroupArray && taskGroupArray.length>0){
				Integer taskId=Integer.valueOf(transMeta.getObjectId().getId());
				for(String taskGroupName:taskGroupArray){
					if(StringDateUtil.isEmpty(taskGroupName)){
						continue;
					}
					TaskGroupAttributeEntity attr=new TaskGroupAttributeEntity();
					attr.setTaskGroupName(taskGroupName);
					attr.setType("trans");
					attr.setTaskId(taskId);
					attr.setTaskPath(dir + transName);
					attr.setTaskName(transName);
					sqlSession.insert("org.sxdata.jingwei.dao.TaskGroupDao.addTaskGroupAttribute",attr);
				}
				sqlSession.commit();
				sqlSession.close();
			}
			String transPath = directory.getPath();
			if(!transPath.endsWith("/"))
				transPath = transPath + '/';
			transPath = transPath + transName;
			JsonUtils.success(transPath);
		} catch (Exception e) {
			//出现异常回滚
			e.printStackTrace();
			if(e instanceof KettleException){
				repository.disconnect();
				repository.init( App.getInstance().meta);
				repository.connect("admin", "admin");
			}
			sqlSession.rollback();
			sqlSession.close();
			//删除转换
			if(isSuccess){
				ObjectId id = repository.getTransformationID(transName, directory);
				repository.deleteTransformation(id);
			}
			JsonUtils.fail("创建失败!");
		}
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/createJob")
	protected void createJob(@RequestParam String dir, @RequestParam String jobName,@RequestParam String[] taskGroupArray) throws KettleException, IOException {
		Repository repository = App.getInstance().getRepository();
		SqlSession sqlSession=CarteClient.sessionFactory.openSession();;
        RepositoryDirectoryInterface directory = null;
		boolean isSuccess=false;
		try{

             directory = repository.findDirectory(dir);
			if(directory == null)
                directory = repository.getUserHomeDirectory();
            if(repository.exists(jobName, directory, RepositoryObjectType.JOB)) {
                JsonUtils.fail("该作业已经存在，请重新输入！");
                return;
            }
			JobMeta jobMeta = new JobMeta();
			jobMeta.setRepository(App.getInstance().getRepository());
			jobMeta.setMetaStore(App.getInstance().getMetaStore());
			jobMeta.setName(jobName);
			jobMeta.setRepositoryDirectory(directory);
			repository.save(jobMeta, "add: " + new Date(), null);
			isSuccess=true;
			//添加任务组记录
			if(null!=taskGroupArray && taskGroupArray.length>0){
				Integer taskId=Integer.valueOf(jobMeta.getObjectId().getId());
				for(String taskGroupName:taskGroupArray){
					if(StringDateUtil.isEmpty(taskGroupName)){
						continue;
					}
					TaskGroupAttributeEntity attr=new TaskGroupAttributeEntity();
					attr.setTaskGroupName(taskGroupName);
					attr.setType("job");
					attr.setTaskId(taskId);
					attr.setTaskPath(dir + jobName);
					attr.setTaskName(jobName);
					sqlSession.insert("org.sxdata.jingwei.dao.TaskGroupDao.addTaskGroupAttribute",attr);
				}
				sqlSession.commit();
				sqlSession.close();
			}
			String jobPath = directory.getPath();
			if(!jobPath.endsWith("/"))
				jobPath = jobPath + '/';
			jobPath = jobPath + jobName;

			JsonUtils.success(jobPath);
		}catch (Exception e){
			//数据库连接出现问题后kettle内部api资源库连接失效需要捕获异常后重新连接
			e.printStackTrace();
			if(e instanceof KettleException){
				repository.disconnect();
				repository.init( App.getInstance().meta);
				repository.connect("admin", "admin");
			}
			sqlSession.rollback();
			sqlSession.close();
			//删除作业
			if(isSuccess){
				ObjectId id = repository.getJobId(jobName, directory);
				repository.deleteJob(id);
			}
			JsonUtils.fail("作业创建失败!");
		}
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/drop")
	protected void drop(@RequestParam String path, @RequestParam String type) throws KettleException, IOException {
		Repository repository = App.getInstance().getRepository();
		
		String dir = path.substring(0, path.lastIndexOf("/"));
		String name = path.substring(path.lastIndexOf("/") + 1);
		RepositoryDirectoryInterface directory = repository.findDirectory(dir);
		if(directory == null)
			directory = repository.getUserHomeDirectory();
		
		if(RepositoryObjectType.TRANSFORMATION.getTypeDescription().equals(type)) {
			ObjectId id = repository.getTransformationID(name, directory);
			repository.deleteTransformation(id); 
		} else if(RepositoryObjectType.JOB.getTypeDescription().equals(type)) {
			ObjectId id = repository.getJobId(name, directory);
			repository.deleteJob(id);
		} else if(!StringUtils.hasText(type)) {
			directory = repository.findDirectory(path);
			if(repository.getJobAndTransformationObjects(directory.getObjectId(), true).size() > 0) {
				JsonUtils.fail("删除失败，该目录下存在子元素，请先移除他们！");
				return;
			}
			
			if(repository.getDirectoryNames(directory.getObjectId()).length > 0) {
				JsonUtils.fail("删除失败，该目录下存在子元素，请先移除他们！");
				return;
			}
			
			repository.deleteRepositoryDirectory(directory);
		}
		
		JsonUtils.success("操作成功");
	}
	
	/**
	 * 该方法获取所有的仓库类型，目前支持数据库和文件系统类型
	 * @throws IOException 
	 * 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/types")
	protected void types() throws IOException {
		JSONArray jsonArray = new JSONArray();
		
		PluginRegistry registry = PluginRegistry.getInstance();
	    Class<? extends PluginTypeInterface> pluginType = RepositoryPluginType.class;
	    List<PluginInterface> plugins = registry.getPlugins(pluginType);

	    for ( int i = 0; i < plugins.size(); i++ ) {
	      PluginInterface plugin = plugins.get( i );
	      
	      JSONObject jsonObject = new JSONObject();
	      jsonObject.put("type", plugin.getIds()[0]);
	      jsonObject.put("name", plugin.getName() + " : " + plugin.getDescription());
	      jsonArray.add(jsonObject);
	    }

	    JsonUtils.response(jsonArray);
	}

	/**
	 * 加载指定的资源库信息
	 * 
	 * @param reposityId
	 * @throws IOException 
	 * @throws KettleException 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.GET, value = "/{reposityId}")
	protected void reposity(@PathVariable String reposityId) throws KettleException,IOException {
		RepositoriesMeta input = new RepositoriesMeta();
		if (input.readData()) {
			RepositoryMeta repositoryMeta = input.searchRepository( reposityId );
			if(repositoryMeta != null) {
				JsonUtils.response(RepositoryCodec.encode(repositoryMeta));
			}
		}
	}
	
	/**
	 * 加载指定的资源库信息
	 * 
	 * @param path
	 * @throws Exception 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/open")
	protected void open(@RequestParam String path, @RequestParam String type) throws Exception {
		String dir = path.substring(0, path.lastIndexOf("/"));
		String name = path.substring(path.lastIndexOf("/") + 1);
		Repository repository = App.getInstance().getRepository();
		RepositoryDirectoryInterface directory = null;
     try {
			 directory = repository.findDirectory(dir);
			if(directory == null) 	directory = repository.getUserHomeDirectory();
			if(RepositoryObjectType.TRANSFORMATION.getTypeDescription().equals(type)) {
				TransMeta transMeta = repository.loadTransformation(name, directory, null, true, null);
				transMeta.setRepositoryDirectory(directory);

				GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
				String graphXml = codec.encode(transMeta);
				JsonUtils.responseXml(StringEscapeHelper.encode(graphXml));
			} else if(RepositoryObjectType.JOB.getTypeDescription().equals(type)) {
				JobMeta jobMeta = repository.loadJob(name, directory, null, null);
				jobMeta.setRepositoryDirectory(directory);

				GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.JOB_CODEC);
				String graphXml = codec.encode(jobMeta);
				JsonUtils.responseXml(StringEscapeHelper.encode(graphXml));

			}

		}catch (Exception e){
			//数据库连接出现问题后kettle内部api资源库连接失效需要捕获异常后重新连接
			e.printStackTrace();
			if(e instanceof KettleException){
				Repository appRepo = App.getInstance().getRepository();
				appRepo.disconnect();
				appRepo.init(App.getInstance().meta);
				appRepo.connect("admin", "admin");
			}
		}
	}
	
	/**
	 * 资源库浏览，生成树结构
	 *
	 * @throws KettleException
	 * @throws IOException
	 */
	@RequestMapping(method=RequestMethod.POST, value="/explorer")
	protected @ResponseBody List explorer(@RequestParam String path, @RequestParam int loadElement) throws KettleException, IOException {
		ArrayList list = new ArrayList();
		
		Repository repository = App.getInstance().getRepository();
		RepositoryDirectoryInterface dir = null;
		if(StringUtils.hasText(path))
			dir = repository.findDirectory(path);
		else
			dir = repository.getUserHomeDirectory();
		
		List<RepositoryDirectoryInterface> directorys = dir.getChildren();
		for(RepositoryDirectoryInterface child : directorys) {
			list.add(RepositoryNode.initNode(child.getName(), child.getPath()));
		}
		
		if(RepositoryNodeType.includeTrans(loadElement)) {
			List<RepositoryElementMetaInterface> elements = repository.getTransformationObjects(dir.getObjectId(), false);
			if(elements != null) {
				for(RepositoryElementMetaInterface e : elements) {
					String transPath = dir.getPath();
					if(!transPath.endsWith("/"))
						transPath = transPath + '/';
					transPath = transPath + e.getName();
					
					list.add(RepositoryNode.initNode(e.getName(),  transPath, e.getObjectType()));
				}
			}
		}
		
		if(RepositoryNodeType.includeJob(loadElement)) {
			List<RepositoryElementMetaInterface> elements = repository.getJobObjects(dir.getObjectId(), false);
			if(elements != null) {
				for(RepositoryElementMetaInterface e : elements) {
					String transPath = dir.getPath();
					if(!transPath.endsWith("/"))
						transPath = transPath + '/';
					transPath = transPath + e.getName();
					
					list.add(RepositoryNode.initNode(e.getName(),  transPath, e.getObjectType()));
				}
			}
		}

		return list;
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/exp")
	protected @ResponseBody void exp(@RequestParam String data) throws KettleException, IOException {
		JSONArray jsonArray = JSONArray.fromObject(data);
		
		Repository repository = App.getInstance().getRepository();
		
		File file = new File("exp_" + repository.getName() +"_" + String.format("%1$tY%1$tm%1$td%1$tH%1$tM%1$tS", new Date()) + ".zip");
		FileOutputStream fos = new FileOutputStream(file);
		ZipOutputStream out = new ZipOutputStream( fos );
		
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			String path = jsonObject.optString("path");
			String entryPath = path.substring(1);
			String dir = path.substring(0, path.lastIndexOf("/"));
			String name = path.substring(path.lastIndexOf("/") + 1);
			
			RepositoryDirectoryInterface directory = repository.findDirectory(dir);
			if(RepositoryObjectType.TRANSFORMATION.getTypeDescription().equals(jsonObject.optString("type"))) {
				TransMeta transMeta = repository.loadTransformation(name, directory, null, true, null);
				String xml = XMLHandler.getXMLHeader() + "\n" + transMeta.getXML();
				out.putNextEntry(new ZipEntry(entryPath + RepositoryObjectType.TRANSFORMATION.getExtension()));	
				out.write(xml.getBytes(Const.XML_ENCODING));
			} else if(RepositoryObjectType.JOB.getTypeDescription().equals(jsonObject.optString("type"))) {
				JobMeta jobMeta = repository.loadJob(name, directory, null, null);
				String xml = XMLHandler.getXMLHeader() + "\n" + jobMeta.getXML();
				out.putNextEntry(new ZipEntry(entryPath + RepositoryObjectType.JOB.getExtension()));	
				out.write(xml.getBytes(Const.XML_ENCODING));
			}
			
		}
		
		out.close();
		fos.close();

		JsonUtils.success(StringEscapeHelper.encode(file.getAbsolutePath()));
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/imp")
	protected @ResponseBody void imp(@RequestParam String filePath, @RequestParam String data) throws KettleException, IOException {
		File file = new File(filePath);
		ZipFile zip = new ZipFile(file);
		
		Repository repository = App.getInstance().getRepository();
		JSONArray jsonArray = JSONArray.fromObject(data);
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			String path = jsonObject.optString("path");
			String entryPath = path.substring(1);
			String dir = path.substring(0, path.lastIndexOf("/") + 1);
			
			RepositoryDirectoryInterface parent = repository.getUserHomeDirectory();
			int t = dir.indexOf("/", 1);
			while(t > 0) {
				String cur = dir.substring(0, t);
				RepositoryDirectoryInterface directory = repository.findDirectory(cur);
				if(directory == null)
					parent = repository.createRepositoryDirectory(parent, cur.substring(cur.lastIndexOf("/") + 1));
				else
					parent = directory;
				t = dir.indexOf("/", t + 1);
			}
			
			ZipEntry entry = zip.getEntry(entryPath);
			InputStream is = zip.getInputStream(entry);
			try {
				Document doc = XMLHandler.loadXMLFile(is);
				Element root = doc.getDocumentElement();
				
				if(RepositoryObjectType.TRANSFORMATION.getTypeDescription().equals(jsonObject.optString("type"))) {
					TransMeta transMeta = new TransMeta();
					transMeta.loadXML(root, null, App.getInstance().getMetaStore(), repository, true, new Variables(), null);
				    transMeta.setRepositoryDirectory( parent );
				    
				    repository.save(transMeta, null, null);
				} else if(RepositoryObjectType.JOB.getTypeDescription().equals(jsonObject.optString("type"))) {
					JobMeta jobMeta = new JobMeta();
					jobMeta.loadXML(root, repository, null);
					jobMeta.setRepositoryDirectory(parent);
					repository.save(jobMeta, null, null);
				}
			    
			} finally {
				IOUtils.closeQuietly(is);
			}
		}
		
		zip.close();
		file.delete();
		JsonUtils.success("导入成功！");
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/imptree")
	protected @ResponseBody List imptree(@RequestParam String filePath) throws KettleException, IOException {
		FileInputStream fis = new FileInputStream(new File(filePath));
		ZipInputStream is = new ZipInputStream(fis);
		
		ArrayList<RepositoryCheckNode> list = new ArrayList<RepositoryCheckNode>();
		ZipFile zip = new ZipFile(new File(filePath));
		Enumeration<ZipEntry> iter = (Enumeration<ZipEntry>) zip.entries();
		while(iter.hasMoreElements()) {
			List<RepositoryCheckNode> temp = list;
			ZipEntry entry = iter.nextElement();
			String[] strings = entry.getName().split("/");
			String currentDir = "";
			for(int i=0; i<strings.length; i++) {
				currentDir += "/" + strings[i];
				
				boolean found = false;
				for(RepositoryCheckNode node : temp) {
					if(node.getText().equals(strings[i])) {
						temp = node.getChildren();
						found = true;
						break;
					}
				}
				
				if(!found) {
					RepositoryCheckNode node = null;
					if(i == (strings.length - 1)) {
						if(strings[i].endsWith(RepositoryObjectType.TRANSFORMATION.getExtension())) {
							node = RepositoryCheckNode.initNode(strings[i], currentDir, RepositoryObjectType.TRANSFORMATION, true);
						} else if(strings[i].endsWith(RepositoryObjectType.JOB.getExtension())) {
							node = RepositoryCheckNode.initNode(strings[i], currentDir, RepositoryObjectType.JOB, true);
						}
					} else {
						node = RepositoryCheckNode.initNode(strings[i], currentDir);
					}
					temp.add(node);
					temp = node.getChildren();
				}
			}
			
		}
		
		is.close();
		fis.close();
		
		return list;
	}

	@RequestMapping(method=RequestMethod.POST, value="/exptree")
	protected @ResponseBody List exptree(@RequestParam int loadElement) throws KettleException, IOException {
		Repository repository = App.getInstance().getRepository();
		RepositoryDirectoryInterface dir = repository.getUserHomeDirectory();
		List list = browser(repository, dir, loadElement);
		return list;
	}
	
	private List browser(Repository repository, RepositoryDirectoryInterface dir, int loadElement) throws KettleException {
		ArrayList list = new ArrayList();
		
		List<RepositoryDirectoryInterface> directorys = dir.getChildren();
		for(RepositoryDirectoryInterface child : directorys) {
//			RepositoryCheckNode node = new RepositoryCheckNode(child.getName());
//			node.setChildren(browser(repository, child, loadElement));
//			node.setPath(child.getPath());
			list.add(RepositoryCheckNode.initNode(child.getName(), child.getPath(), browser(repository, child, loadElement)));
		}
		
		if(RepositoryNodeType.includeTrans(loadElement)) {
			List<RepositoryElementMetaInterface> elements = repository.getTransformationObjects(dir.getObjectId(), false);
			if(elements != null) {
				for(RepositoryElementMetaInterface e : elements) {
					String transPath = dir.getPath();
					if(!transPath.endsWith("/"))
						transPath = transPath + '/';
					transPath = transPath + e.getName();
					
					list.add(RepositoryCheckNode.initNode(e.getName(), transPath, e.getObjectType()));
					
				}
			}
		}
		
		if(RepositoryNodeType.includeJob(loadElement)) {
			List<RepositoryElementMetaInterface> elements = repository.getJobObjects(dir.getObjectId(), false);
			if(elements != null) {
				for(RepositoryElementMetaInterface e : elements) {
					String transPath = dir.getPath();
					if(!transPath.endsWith("/"))
						transPath = transPath + '/';
					transPath = transPath + e.getName();
					
					list.add(RepositoryCheckNode.initNode(e.getName(), transPath, e.getObjectType()));
				}
			}
		}
		
		return list;
	}
	
	/**
	 * 新增或修改资源库
	 * 
	 * @param reposityInfo
	 * @param add 操作类型,true - 新建
	 * @throws IOException 
	 * @throws KettleException 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/add")
	protected void add(@RequestParam String reposityInfo, @RequestParam boolean add) throws IOException, KettleException {
		JSONObject jsonObject = JSONObject.fromObject(reposityInfo);
		
		RepositoryMeta repositoryMeta = RepositoryCodec.decode(jsonObject);
		Repository reposity = PluginRegistry.getInstance().loadClass( RepositoryPluginType.class,  repositoryMeta, Repository.class );
		reposity.init( repositoryMeta );
	        
		if ( repositoryMeta instanceof KettleDatabaseRepositoryMeta && !StringUtils.hasText(jsonObject.optJSONObject("extraOptions").optString("database")) ) {
			JsonUtils.fail(BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.Error.Title" ), 
					BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.ErrorNoConnection.Message" ));
			return;
		} else if(!StringUtils.hasText(repositoryMeta.getName())) {
			JsonUtils.fail(BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.Error.Title" ), 
					BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.ErrorNoId.Message" ));
			return;
		} else if(!StringUtils.hasText(repositoryMeta.getDescription())) {
			JsonUtils.fail(BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.Error.Title" ), 
					BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.ErrorNoName.Message" ));
			return;
		} else {
			RepositoriesMeta input = new RepositoriesMeta();
			input.readData();
			
			if(add) {
				if(input.searchRepository(repositoryMeta.getName()) != null) {
					JsonUtils.fail(BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.Error.Title" ), 
							BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.ErrorIdExist.Message", repositoryMeta.getName()));
					return;
				} else {
					input.addRepository(repositoryMeta);
					input.writeData();
				}
			} else {
				RepositoryMeta previous = input.searchRepository(repositoryMeta.getName());
				input.removeRepository(input.indexOfRepository(previous));
				input.addRepository(repositoryMeta);
				input.writeData();
			}
		}
		JsonUtils.success("操作成功！");
	}
	
	/**
	 * 删除资源库
	 * 
	 * @param repositoryName
	 * @throws KettleException 
	 * @throws IOException 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/remove")
	protected void remove(@RequestParam String repositoryName) throws KettleException, IOException {
		RepositoriesMeta input = new RepositoriesMeta();
		input.readData();
		
		RepositoryMeta previous = input.searchRepository(repositoryName);
		input.removeRepository(input.indexOfRepository(previous));
		input.writeData();
		
		JsonUtils.success("操作成功！");
	}
	
	/**
	 * 登录资源库
	 * 
	 * @param loginInfo
	 * @throws IOException 
	 * @throws KettleException 
	 * @throws KettleSecurityException 
	 * @throws KettlePluginException 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/login")
	protected void login(@RequestParam String loginInfo, Model model) throws IOException, KettlePluginException, KettleSecurityException, KettleException {
		JSONObject jsonObject = JSONObject.fromObject(loginInfo);
		RepositoriesMeta input = new RepositoriesMeta();
		if (input.readData()) {
			RepositoryMeta repositoryMeta = input.searchRepository( jsonObject.optString("reposityId") );
			if(repositoryMeta != null) {
				Repository repository = PluginRegistry.getInstance().loadClass(RepositoryPluginType.class, repositoryMeta.getId(), Repository.class );
			    repository.init( repositoryMeta );
			    repository.connect( jsonObject.optString("username"), jsonObject.optString("password") );
			    
			    
			    
			    Props.getInstance().setLastRepository( repositoryMeta.getName() );
			    Props.getInstance().setLastRepositoryLogin( jsonObject.optString("username") );
			    Props.getInstance().setProperty( PropsUI.STRING_START_SHOW_REPOSITORIES, jsonObject.optBoolean("atStartupShown") ? "Y" : "N");
			    
			    Props.getInstance().saveProps();
			    
			    App.getInstance().selectRepository(repository);
			}
		}
		
		JsonUtils.success("登录成功！");
	}
	
	/**
	 * 获取资源库信息
	 * 
	 * @param
	 * @throws IOException 
	 * @throws KettleException 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/load")
	protected void load() throws IOException, KettleException {
		Repository repository = App.getInstance().getRepository();
		
		JSONObject info = new JSONObject();
		
		
		ObjectId[] databaseIds = repository.getDatabaseIDs(false);
		JSONArray jsonArray = new JSONArray();
		for(ObjectId databaseId: databaseIds) {
			DatabaseMeta databaseMeta = repository.loadDatabaseMeta(databaseId, null);
			JSONObject jsonObject = DatabaseCodec.encode(databaseMeta);
			jsonObject.put("changedDate", XMLHandler.date2string(databaseMeta.getChangedDate()));
			jsonArray.add(jsonObject);
		}
		info.put("databases", jsonArray);
		
		ObjectId[] slaveIds = repository.getSlaveIDs(false);
		jsonArray = new JSONArray();
		for(ObjectId slaveId: slaveIds) {
			SlaveServer slaveServer = repository.loadSlaveServer(slaveId, null);
			JSONObject jsonObject = SlaveServerCodec.encode(slaveServer);
			jsonArray.add(jsonObject);
		}
		info.put("slaves", jsonArray);
		JsonUtils.response(info);
	}
	
	/**
	 * 断开资源库
	 * 
	 * @param
	 * @throws IOException 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/logout")
	protected void logout() throws IOException {
		App.getInstance().selectRepository(App.getInstance().getDefaultRepository());
		JsonUtils.success("操作成功！");
	}
	
}
