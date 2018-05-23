package org.flhy.ext.trans.step;

import org.pentaho.di.trans.step.StepMeta;
import org.w3c.dom.Element;

public interface StepEncoder {

	public Element encodeStep(StepMeta stepMeta) throws Exception;
	
}
