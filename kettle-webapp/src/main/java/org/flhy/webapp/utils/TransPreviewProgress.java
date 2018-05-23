package org.flhy.webapp.utils;

import java.util.ArrayList;
import java.util.List;

import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.core.logging.KettleLogStore;
import org.pentaho.di.core.row.RowMetaInterface;
import org.pentaho.di.trans.Trans;
import org.pentaho.di.trans.TransMeta;
import org.pentaho.di.trans.debug.BreakPointListener;
import org.pentaho.di.trans.debug.StepDebugMeta;
import org.pentaho.di.trans.debug.TransDebugMeta;
import org.pentaho.di.trans.step.StepMeta;

public class TransPreviewProgress {
	  private TransMeta transMeta;
	  private String[] previewStepNames;
	  private int[] previewSize;
	  private Trans trans;

	  private String loggingText;
	  private TransDebugMeta transDebugMeta;

	  public TransPreviewProgress( TransMeta transMeta, String[] previewStepNames, int[] previewSize ) throws Exception {
	    this.transMeta = transMeta;
	    this.previewStepNames = previewStepNames;
	    this.previewSize = previewSize;
	    
	    doPreview();
	  }


	  private void doPreview() throws KettleException {
	    // This transformation is ready to run in preview!
	    trans = new Trans( transMeta );
	    trans.setPreview( true );

	    // Prepare the execution...
	    //
		trans.prepareExecution(null);

	    // Add the preview / debugging information...
	    //
	    transDebugMeta = new TransDebugMeta( transMeta );
		for (int i = 0; i < previewStepNames.length; i++) {
			StepMeta stepMeta = transMeta.findStep(previewStepNames[i]);
			StepDebugMeta stepDebugMeta = new StepDebugMeta(stepMeta);
			stepDebugMeta.setReadingFirstRows(true);
			stepDebugMeta.setRowCount(previewSize[i]);
			transDebugMeta.getStepDebugMetaMap().put(stepMeta, stepDebugMeta);
		}

	    // set the appropriate listeners on the transformation...
	    //
	    transDebugMeta.addRowListenersToTransformation( trans );

	    // Fire off the step threads... start running!
	    //
		trans.startThreads();

//	    int previousPct = 0;
	    final List<String> previewComplete = new ArrayList<String>();

	    while ( previewComplete.size() < previewStepNames.length  && !trans.isFinished() ) {
	      // We add a break-point that is called every time we have a step with a full preview row buffer
	      // That makes it easy and fast to see if we have all the rows we need
	      //
			transDebugMeta.addBreakPointListers(new BreakPointListener() {
				public void breakPointHit(TransDebugMeta transDebugMeta, StepDebugMeta stepDebugMeta, RowMetaInterface rowBufferMeta, List<Object[]> rowBuffer) {
					String stepName = stepDebugMeta.getStepMeta().getName();
					previewComplete.add(stepName);
				}
			});


	      // Change the percentage...
	      try {
	        Thread.sleep( 500 );
	      } catch ( InterruptedException e ) {
	        // Ignore errors
	      }

	    }

	    trans.stopAll();

	    // Capture preview activity to a String:
	    loggingText = KettleLogStore.getAppender().getBuffer( trans.getLogChannel().getLogChannelId(), true ).toString();
	  }

	public List<Object[]> getPreviewRows(String stepname) {
		if (transDebugMeta == null) {
			return null;
		}

		for (StepMeta stepMeta : transDebugMeta.getStepDebugMetaMap().keySet()) {
			if (stepMeta.getName().equals(stepname)) {
				StepDebugMeta stepDebugMeta = transDebugMeta.getStepDebugMetaMap().get(stepMeta);
				return stepDebugMeta.getRowBuffer();
			}
		}
		return null;
	}

	public RowMetaInterface getPreviewRowsMeta(String stepname) {
		if (transDebugMeta == null) {
			return null;
		}

		for (StepMeta stepMeta : transDebugMeta.getStepDebugMetaMap().keySet()) {
			if (stepMeta.getName().equals(stepname)) {
				StepDebugMeta stepDebugMeta = transDebugMeta.getStepDebugMetaMap().get(stepMeta);
				return stepDebugMeta.getRowBufferMeta();
			}
		}
		return null;
	}

	public String getLoggingText() {
		return loggingText;
	}

	public Trans getTrans() {
		return trans;
	}

	public TransDebugMeta getTransDebugMeta() {
		return transDebugMeta;
	}
	  
}
