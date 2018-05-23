package org.sxdata.jingwei.util.TaskUtil;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.pentaho.di.www.SlaveServerStatus;

import java.lang.management.OperatingSystemMXBean;
import java.util.Iterator;
import java.util.List;

/**
 * Desc:
 * email: zhangqj@zjhcsoft.com
 * Created by ZhangQingJing on 2015/7/27 16:14
 */
public class CarteStatusVo {
	private int runingJobNum;
	private int runningTransNum;
	private double totalMem;
	private double freeMem;
	private long cpuPerc;
	private int threadCount;
	private double loadAvg;
	private int cpuCores;
	private String freeMemPercent;
	private double loadAvgPerCore;
	private String upTime;

	/* and so on..选择有价值的展现内容*/

	public int getRunningJobNum() {
		return runingJobNum;
	}

	public void setRuningJobNum(int runingJobNum) {
		this.runingJobNum = runingJobNum;
	}

	public int getRunningTransNum() {
		return runningTransNum;
	}

	public void setRunningTransNum(int runningTransNum) {
		this.runningTransNum = runningTransNum;
	}

	public double getTotalMem() {
		return totalMem;
	}

	public void setTotalMem(double totalMem) {
		this.totalMem = totalMem;
	}

	public double getFreeMem() {
		return freeMem;
	}

	public void setFreeMem(double freeMem) {
		this.freeMem = freeMem;
	}

	public long getCpuPerc() {
		return cpuPerc;
	}

	public void setCpuPerc(long cpuPerc) {
		this.cpuPerc = cpuPerc;
	}

	public int getThreadCount() { return threadCount; }

	public void setThreadCount(int threadCount) { this.threadCount = threadCount; }

	public double getLoadAvg() { return loadAvg; }

	public void setLoadAvg(int loadAvg) { this.loadAvg = loadAvg; }

	public double getCpuCores() { return cpuCores; }

	public void setCpuCores(int cpuCores) { this.cpuCores = cpuCores; }

	public String getFreeMemPercent() { return freeMemPercent; }

	public void setFreeMemPercent(String freeMemPercent) { this.freeMemPercent = freeMemPercent; }

	public double getLoadAvgPerCore() { return loadAvgPerCore; }

	public void setLoadAvgPerCore(double loadAvgPerCore) { this.loadAvgPerCore = loadAvgPerCore; }

	public String getUpTime() { return upTime; }

	public void setUpTime(String upTime) { this.upTime = upTime; }

	/**
	 * 解析返回展示对象
	 * @param xml
	 * @return
	 */
	public static CarteStatusVo parseXml(String xml) throws Exception {
		CarteStatusVo carteStatusVo = new CarteStatusVo();
		carteStatusVo.runingJobNum = getRunningJobNum(xml);//from xml...
		carteStatusVo.runningTransNum = getRunningTransNum(xml);
		SlaveServerStatus slaveServer = SlaveServerStatus.fromXML(xml);
		carteStatusVo.setThreadCount(slaveServer.getThreadCount());
		carteStatusVo.totalMem = slaveServer.getMemoryTotal();
		carteStatusVo.freeMem = slaveServer.getMemoryFree();
		carteStatusVo.cpuPerc = slaveServer.getCpuProcessTime();
		carteStatusVo.loadAvg = slaveServer.getLoadAvg();
		carteStatusVo.cpuCores = slaveServer.getCpuCores();
		carteStatusVo.freeMemPercent = "0." + (int)((carteStatusVo.freeMem/carteStatusVo.totalMem)*100);
		carteStatusVo.loadAvgPerCore = carteStatusVo.loadAvg / carteStatusVo.cpuCores;
		carteStatusVo.upTime = formatTime(slaveServer.getUptime());

		return carteStatusVo;
	}



	public static int getRunningTransNum(String xml) throws Exception {
		int num = 0;
		Document document = DocumentHelper.parseText(xml);
		Element root = document.getRootElement();
		Element transstatuslist = root.element("transstatuslist");
		List<Element> trans = transstatuslist.elements("transstatus");
		for (Iterator<Element> it = trans.iterator(); it.hasNext();) {
			Element job = it.next();
			Element status_desc = job.element("status_desc");
			if (status_desc.getText().equals("Running"))
				num++;
		}
		return num;
	}

	public static int getRunningJobNum(String xml) throws Exception {
		int num = 0;
		Document document = DocumentHelper.parseText(xml);
		Element root = document.getRootElement();
		Element jobstatuslist = root.element("jobstatuslist");
		List<Element> jobs = jobstatuslist.elements("jobstatus");
		for (Iterator<Element> it = jobs.iterator(); it.hasNext();) {
			Element job = it.next();
			Element status_desc = job.element("status_desc");
			if (status_desc.getText().equals("Running"))
				num++;
		}
		return num;
	}

	/*
* 毫秒转化
*/
	public static String formatTime(long ms) {

		int ss = 1000;
		int mi = ss * 60;
		int hh = mi * 60;
		int dd = hh * 24;
		long day = ms / dd;
		long hour = (ms - day * dd) / hh;
		long minute = (ms - day * dd - hour * hh) / mi;
		long second = (ms - day * dd - hour * hh - minute * mi) / ss;
		long milliSecond = ms - day * dd - hour * hh - minute * mi - second * ss;
		String strDay = day < 10 ? "0" + day + "天" : day + "天";
		String strHour = hour < 10 ? "0" + hour + "小时" : hour + "小时";
		String strMinute = minute < 10 ? "0" + minute + "分" : minute + "分";
		String strSecond = second < 10 ? "0" + second + "秒" : second + "秒";
		String strMilliSecond = milliSecond < 10 ? "0" + milliSecond : "" + milliSecond;
		strMilliSecond = milliSecond < 100 ? "0" + strMilliSecond : strMilliSecond;

		return strDay  + strHour  + strMinute  + strSecond ;
	}

	public static void main(String[] args) {
		System.out.println(formatTime(60000*60*24L));
		long freeMemory = Runtime.getRuntime().freeMemory();
		long totalMemory = Runtime.getRuntime().totalMemory();


		OperatingSystemMXBean operatingSystemMXBean =
			java.lang.management.ManagementFactory.getOperatingSystemMXBean();



		System.out.println(freeMemory);
		System.out.println(totalMemory);
		System.out.println(operatingSystemMXBean.getAvailableProcessors());
	}
}