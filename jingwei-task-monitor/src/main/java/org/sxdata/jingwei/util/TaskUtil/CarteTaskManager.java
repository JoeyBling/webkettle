package org.sxdata.jingwei.util.TaskUtil;


import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.defaults.DefaultSqlSessionFactory;
import org.flhy.ext.JobExecutor;
import org.flhy.ext.PluginFactory;
import org.flhy.ext.base.GraphCodec;
import org.flhy.ext.job.JobExecutionConfigurationCodec;
import org.flhy.ext.utils.RepositoryUtils;
import org.pentaho.di.job.JobExecutionConfiguration;
import org.pentaho.di.job.JobMeta;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;
import org.sxdata.jingwei.entity.*;
import org.sxdata.jingwei.entity.JobEntity;
import org.sxdata.jingwei.service.Impl.JobServiceImpl;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.TimeUnit;
import static org.quartz.CronScheduleBuilder.cronSchedule;
import static org.quartz.CronScheduleBuilder.weeklyOnDayAndHourAndMinute;
import static org.quartz.JobBuilder.newJob;
import static org.quartz.SimpleScheduleBuilder.simpleSchedule;
import static org.quartz.TriggerBuilder.newTrigger;


public class CarteTaskManager {
	public static Map<String,JobTimeSchedulerEntity> jobTimerMap=new HashMap<>();
	public static LinkedBlockingDeque<Task> queue = new LinkedBlockingDeque<Task>(30000);
	private static SchedulerFactory sf = new StdSchedulerFactory();
	private static Scheduler sched = null;
	private static Trigger trigger =null;
	private static JobDetail job = null;
	private static boolean runFlag = true;
	public static final String JOB_TIMER_TASK_GROUP = "job_timer_task_group";

	public static boolean isRunFlag() {
		return runFlag;
	}

	public static void setRunFlag(boolean runFlag) {
		CarteTaskManager.runFlag = runFlag;
	}

	public static void addTask(CarteClient carteClient, String type, String url) {
		queue.add(new CarteTask(carteClient, type, url));
	}

	public static void addTimerTask(JobExecutor jobExecutor, String loglevel, JobTimeSchedulerEntity dTimerschedulerEntity,UserEntity user) {
		queue.add(new JobTimerTask(jobExecutor, loglevel, dTimerschedulerEntity,user));
	}

	private static abstract class Task{
		public abstract void run();

	}

	private static class CarteTask extends Task{
		CarteClient carteClient;
		String type;
		String url;
		public CarteTask(CarteClient carteClient, String type, String url) {
			this.carteClient = carteClient;
			this.type = type;
			this.url = url;
		}
		@Override
		public void run() {
			CarteClient cc = this.carteClient;
			final String urlString = this.url;
			String result = null;
			try {
				result=cc.doGet(urlString);
			} catch (IOException e) {
				e.printStackTrace();
			}
			System.out.println(this + ":  ===>  在 carteId: " + cc.getSlave().getHostName() + " 执行: " + urlString + "  结果: " + result);
		}
	}

	private static class JobTimerTask extends Task {
		JobExecutor jobExecutor;
		String loglevel;
		JobTimeSchedulerEntity dTimerschedulerEntity;
		UserEntity loginUser;

		public JobTimerTask(JobExecutor jobExecutor,String loglevel,JobTimeSchedulerEntity dTimerschedulerEntity,UserEntity user) {
			this.jobExecutor = jobExecutor;
			this.loglevel = loglevel;
			this.dTimerschedulerEntity = dTimerschedulerEntity;
			this.loginUser=user;
		}

		@Override
		public void run() {
			try {
				sched = sf.getScheduler();
				//获取定时信息
				String isRepeat = dTimerschedulerEntity.getIsrepeat();
				int schedulertype = dTimerschedulerEntity.getSchedulertype();
				if(dTimerschedulerEntity.getIntervalminutes()==null){
					dTimerschedulerEntity.setIntervalminutes(0);
				}
				if(dTimerschedulerEntity.getWeekday()==null){
					dTimerschedulerEntity.setWeekday(0);
				}
				if(dTimerschedulerEntity.getDayofmonth()==null){
					dTimerschedulerEntity.setDayofmonth(0);
				}
				Integer intervalminutes = dTimerschedulerEntity.getIntervalminutes();
				Integer minutes = dTimerschedulerEntity.getMinutes();
				Integer hour = dTimerschedulerEntity.getHour();
				Integer weekday = dTimerschedulerEntity.getWeekday();
				Integer dayOfMonth = dTimerschedulerEntity.getDayofmonth();
				//设置定时信息
				long idJobTask = dTimerschedulerEntity.getIdJobtask();
				job = newJob(org.sxdata.jingwei.util.quartzUtil.JobTimerTask.class).withIdentity(idJobTask+"",JOB_TIMER_TASK_GROUP).build();
				job.getJobDataMap().put("jobExecutor", jobExecutor);
				job.getJobDataMap().put("loginUser",loginUser);

				if (isRepeat == "Y"||"Y".equals(isRepeat)) {
					if (schedulertype==1){
						long currentTime = System.currentTimeMillis() + intervalminutes * 60 * 1000;
						Date date = new Date(currentTime);
						trigger = newTrigger()
								.withIdentity(idJobTask + "trigger", JOB_TIMER_TASK_GROUP)
								.startAt(date)
								.withSchedule(simpleSchedule().withIntervalInMinutes(intervalminutes).repeatForever())
								.build();
					}else if(schedulertype==2){
						trigger = newTrigger().withIdentity(idJobTask + "trigger", JOB_TIMER_TASK_GROUP).
								withSchedule(cronSchedule("0 " + minutes + " " + hour + " * * ?")).build();
					}else if(schedulertype==3){
						trigger = newTrigger()
								.withIdentity(idJobTask + "trigger", JOB_TIMER_TASK_GROUP)
								.startNow()
								.withSchedule(weeklyOnDayAndHourAndMinute(weekday, hour, minutes))
								.build();
					}else if(schedulertype==4){
						trigger = newTrigger().withIdentity(idJobTask +"trigger", JOB_TIMER_TASK_GROUP).
								withSchedule(cronSchedule("0 " + minutes + " " + hour + " " + dayOfMonth + " * ?")).build();
					}
					//				}else if(isRepeat == "N"){//执行一次性的方法
					//					if (schedulertype==1){
					//						trigger = newTrigger().withIdentity(idJobTask + "trigger", idJobTask + "group").
					//								withSchedule(cronSchedule("0 " + intervalminutes + "/" + intervalminutes + " * * * ?")).build();
					//					}else if(schedulertype==2){
					//						trigger = newTrigger().withIdentity(idJobTask + "trigger", idJobTask + "group").
					//								withSchedule(cronSchedule("0 " + minutes + " " + hour + " * * ?")).build();
					//					}else if(schedulertype==3){
					//						trigger = newTrigger().withIdentity(idJobTask + "trigger", idJobTask + "group").
					//								withSchedule(cronSchedule("0 " + minutes + " " + hour + " ? * " + weekday)).build();
					//					}else if(schedulertype==4){
					//						trigger = newTrigger().withIdentity(idJobTask +"trigger", idJobTask + "group").
					//								withSchedule(cronSchedule("0 " + minutes + " " + hour + " " + dayOfMonth + " * ?")).build();
					//					}
				}
				sched.scheduleJob(job, trigger);
				if (!sched.isShutdown()) {
					sched.start();
				}
			} catch (SchedulerException e) {
				e.printStackTrace();
			}
		}
	}

	public static void startThread(int num) {
		for (int i = 0; i < num; i++) {
			new Thread(new CarteTaskRunnable()).start();
		}
	}

	public static void disableThread() {
		setRunFlag(false);
	}

	static class CarteTaskRunnable implements Runnable {
		@Override
		public void run() {
			while (runFlag) {
				try {
					if (queue.peek() != null) {
						runTask();
					} else {
						TimeUnit.MILLISECONDS.sleep(50);
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
			while (queue.peek() != null) {
				runTask();
			}
		}

		public void runTask() {
			Task task = queue.poll();
			task.run();
		}
	}

	//服务器启动后执行该方法 获取数据库中所有定时作业 加入定时计划
	public static void startJobTimeTask(DefaultSqlSessionFactory bean) throws Exception{
		JobServiceImpl js=new JobServiceImpl();
		//获取session对象查询所有定时作业
		SqlSession session=bean.openSession();
		List<JobTimeSchedulerEntity> jobsTimer=session.selectList("org.sxdata.jingwei.dao.JobSchedulerDao.getAllTimerJob","");
		if(jobsTimer==null || jobsTimer.size()<1){
			System.out.println("当前暂无定时作业");
		}else{
			for(JobTimeSchedulerEntity timerJob:jobsTimer){
				//获取定时作业的参数
				Integer schedulertype = timerJob.getSchedulertype();
				Integer intervalminutes = timerJob.getIntervalminutes();
				Integer minutes = timerJob.getMinutes();
				Integer hour = timerJob.getHour();
				Integer weekday = timerJob.getWeekday();
				Integer dayOfMonth = timerJob.getDayofmonth();
				long idJobTask = timerJob.getIdJobtask();
				Integer jobId = timerJob.getIdJob();
				String executionConfiguration=timerJob.getExecutionConfig();
				//根据id获取当前作业
				JobEntity thisJob=session.selectOne("org.sxdata.jingwei.dao.JobDao.getJobById",jobId);
				System.out.println("定时作业 →"+thisJob.getName()+"已加入定时执行");
				List<JobEntity> jobs=new ArrayList<JobEntity>();
				jobs.add(thisJob);
				//获取作业的全路径
				jobs=js.getJobPath(jobs);
				thisJob=jobs.get(0);
				String jobPath=thisJob.getDirectoryName();
				//封装executor对象
				JobMeta jobMeta = RepositoryUtils.loadJobbyPath(jobPath);
				org.flhy.ext.utils.JSONObject jsonObject = org.flhy.ext.utils.JSONObject.fromObject(executionConfiguration);
				JobExecutionConfiguration jobExecutionConfiguration = JobExecutionConfigurationCodec.decode(jsonObject, jobMeta);
				JobExecutor jobExecutor = new JobExecutor(jobExecutionConfiguration,jobMeta);
				//TODO		把执行需要的参数添加到dataMap	添加定时任务
				JobDetail job = newJob(org.sxdata.jingwei.util.quartzUtil.JobTimerTask.class).withIdentity(idJobTask + "", JOB_TIMER_TASK_GROUP).build();
				List<UserEntity> userEntityList=session.selectList("org.sxdata.jingwei.dao.UserDao.getUserbyName","admin");
				job.getJobDataMap().put("jobExecutor", jobExecutor);
				job.getJobDataMap().put("loginUser", userEntityList.get(0));
				//设置定时规则
				Trigger trigger =null;
				if (schedulertype == 1) {
					long currentTime = System.currentTimeMillis() + intervalminutes * 60 * 1000;
					Date date = new Date(currentTime);
					trigger = newTrigger()
							.withIdentity(idJobTask + "trigger", JOB_TIMER_TASK_GROUP)
							.startAt(date)
							.withSchedule(simpleSchedule().withIntervalInMinutes(intervalminutes).repeatForever())
							.build();
				} else if (schedulertype == 2) {
					trigger = newTrigger().withIdentity(idJobTask + "trigger", JOB_TIMER_TASK_GROUP).
							withSchedule(cronSchedule("0 " + minutes + " " + hour + " * * ?")).build();
				} else if (schedulertype == 3) {
					trigger = newTrigger()
							.withIdentity(idJobTask + "trigger", JOB_TIMER_TASK_GROUP)
							.startNow()
							.withSchedule(weeklyOnDayAndHourAndMinute(weekday, hour, minutes))
							.build();
				} else if (schedulertype == 4) {
					trigger = newTrigger().withIdentity(idJobTask + "trigger", JOB_TIMER_TASK_GROUP).
							withSchedule(cronSchedule("0 " + minutes + " " + hour + " " + dayOfMonth + " * ?")).build();
				}
				Scheduler sched = sf.getScheduler();
				sched.scheduleJob(job, trigger);
				if (!sched.isShutdown()) {
					sched.start();
				}
			}
		}
		session.close();
	}

}
