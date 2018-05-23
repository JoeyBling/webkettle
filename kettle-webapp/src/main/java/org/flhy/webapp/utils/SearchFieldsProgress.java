package org.flhy.webapp.utils;

import java.lang.reflect.InvocationTargetException;

import org.pentaho.di.core.exception.KettleStepException;
import org.pentaho.di.core.row.RowMetaInterface;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.trans.TransMeta;
import org.pentaho.di.trans.step.StepMeta;

public class SearchFieldsProgress {
	private static Class<?> PKG = SearchFieldsProgress.class; 

	private StepMeta stepInfo;
	private boolean before;
	private TransMeta transMeta;
	private RowMetaInterface fields;

	public SearchFieldsProgress(TransMeta transMeta, StepMeta stepMeta, boolean before) {
		this.transMeta = transMeta;
		this.stepInfo = stepMeta;
		this.before = before;
		this.fields = null;
	}

	public void run() throws InvocationTargetException, InterruptedException {
		int size = transMeta.findNrPrevSteps(stepInfo);

		try {
			if (before) {
				fields = transMeta.getPrevStepFields(stepInfo, null);
			} else {
				fields = transMeta.getStepFields(stepInfo, null);
			}
		} catch (KettleStepException kse) {
			throw new InvocationTargetException(kse, BaseMessages.getString(
					PKG, "SearchFieldsProgressDialog.Log.UnableToGetFields", stepInfo.toString(), kse.getMessage()));
		}
	}

	/**
	 * @return Returns the before.
	 */
	public boolean isBefore() {
		return before;
	}

	/**
	 * @param before
	 *            The before to set.
	 */
	public void setBefore(boolean before) {
		this.before = before;
	}

	/**
	 * @return Returns the fields.
	 */
	public RowMetaInterface getFields() {
		return fields;
	}

	/**
	 * @param fields
	 *            The fields to set.
	 */
	public void setFields(RowMetaInterface fields) {
		this.fields = fields;
	}

	/**
	 * @return Returns the stepInfo.
	 */
	public StepMeta getStepInfo() {
		return stepInfo;
	}

	/**
	 * @param stepInfo
	 *            The stepInfo to set.
	 */
	public void setStepInfo(StepMeta stepInfo) {
		this.stepInfo = stepInfo;
	}

	/**
	 * @return Returns the transMeta.
	 */
	public TransMeta getTransMeta() {
		return transMeta;
	}

	/**
	 * @param transMeta
	 *            The transMeta to set.
	 */
	public void setTransMeta(TransMeta transMeta) {
		this.transMeta = transMeta;
	}
}
