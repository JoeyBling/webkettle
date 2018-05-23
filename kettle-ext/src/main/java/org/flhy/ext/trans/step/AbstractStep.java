package org.flhy.ext.trans.step;

import java.util.List;

import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.cluster.ClusterSchema;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.StepPluginType;
import org.pentaho.di.trans.step.RowDistributionInterface;
import org.pentaho.di.trans.step.RowDistributionPluginType;
import org.pentaho.di.trans.step.StepMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.step.StepPartitioningMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;

public abstract class AbstractStep implements StepEncoder, StepDecoder {

	@Override
	public StepMeta decodeStep(mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		String stepid = cell.getAttribute("ctype");
	    String stepname = cell.getAttribute("label");
		
	    PluginRegistry registry = PluginRegistry.getInstance();
	    PluginInterface sp = registry.findPluginWithId( StepPluginType.class, stepid );
	    StepMetaInterface stepMetaInterface = (StepMetaInterface) registry.loadClass( sp );
	    
	    if(stepMetaInterface != null) {
	    	decode(stepMetaInterface, cell, databases, metaStore);
	    	
	    	StepMeta stepMeta = new StepMeta(stepid, stepname, stepMetaInterface);
	    	 /* Handle info general to all step types... */
	        stepMeta.setDescription(cell.getAttribute("description"));
	        stepMeta.setCopiesString(cell.getAttribute("copies"));
	        String sdistri = cell.getAttribute( "distribute" );
	        
	        if ( sdistri == null ) {
	        	stepMeta.setDistributes(true);
	        } else {
	        	stepMeta.setDistributes("Y".equalsIgnoreCase( sdistri ));
	        }
	  
	        // Load the attribute groups map
//	        attributesMap = AttributesUtil.loadAttributes( XMLHandler.getSubNode( stepnode, AttributesUtil.XML_TAG ) );
	  
	        // Determine the row distribution
	        String rowDistributionCode = cell.getAttribute( "custom_distribution" );
	        stepMeta.setRowDistribution(PluginRegistry.getInstance().loadClass(RowDistributionPluginType.class, rowDistributionCode, RowDistributionInterface.class ));
	        
	        
	        // Handle GUI information: location & drawstep?
	        stepMeta.setLocation((int)cell.getGeometry().getX(), (int)cell.getGeometry().getY());
	        stepMeta.setDraw("Y".equalsIgnoreCase( cell.getAttribute( "draw" ) ));
	  
	        // The partitioning information?
	        String partitioning = cell.getAttribute("partitioning");
	        JSONObject jsonObject = JSONObject.fromObject(partitioning);
	        StepPartitioningMeta stepPartitioningMeta = StepPartitioningMetaCodec.decode(jsonObject);
	        stepMeta.setStepPartitioningMeta(stepPartitioningMeta);
	  
	        // Target partitioning information?
	        //TODO
//	        Node targetPartNode = XMLHandler.getSubNode( stepnode, "target_step_partitioning" );
//	        partNode = XMLHandler.getSubNode( targetPartNode, "partitioning" );
//	        if ( partNode != null ) {
//	          targetStepPartitioningMeta = new StepPartitioningMeta( partNode );
//	        }
	  
	        stepMeta.setClusterSchemaName(cell.getAttribute( "cluster_schema" ));
	        
	  
	        // The remote input and output steps...
	        // TODO
//	        Node remotestepsNode = XMLHandler.getSubNode( stepnode, "remotesteps" );
//	        Node inputNode = XMLHandler.getSubNode( remotestepsNode, "input" );
//	        int nrInput = XMLHandler.countNodes( inputNode, RemoteStep.XML_TAG );
//	        for ( int i = 0; i < nrInput; i++ ) {
//	          remoteInputSteps.add( new RemoteStep( XMLHandler.getSubNodeByNr( inputNode, RemoteStep.XML_TAG, i ) ) );
//	        }
//	        Node outputNode = XMLHandler.getSubNode( remotestepsNode, "output" );
//	        int nrOutput = XMLHandler.countNodes( outputNode, RemoteStep.XML_TAG );
//	        for ( int i = 0; i < nrOutput; i++ ) {
//	          remoteOutputSteps.add( new RemoteStep( XMLHandler.getSubNodeByNr( outputNode, RemoteStep.XML_TAG, i ) ) );
//	        }
	    	
	    	return stepMeta;
	    }
		
		return null;
	}

	@Override
	public Element encodeStep(StepMeta stepMeta) throws Exception {
		Element e = encode(stepMeta.getStepMetaInterface());
		
		e.setAttribute("label", stepMeta.getName());
		e.setAttribute("ctype", stepMeta.getTypeId());
		e.setAttribute("draw", stepMeta.isDrawStep() ? "Y" : "N");
		e.setAttribute("distribute", stepMeta.isDistributes() ? "Y" : "N");
		
		StepPartitioningMeta stepPartitioningMeta = stepMeta.getStepPartitioningMeta();
		e.setAttribute("partitioning", StepPartitioningMetaCodec.encode(stepPartitioningMeta).toString());
		if(stepMeta.isPartitioned())
			e.setAttribute("copies", "1");
		else
			e.setAttribute("copies", String.valueOf(stepMeta.getCopies()));
		
		ClusterSchema cs = stepMeta.getClusterSchema();
		if(cs != null) 
			e.setAttribute("cluster_schema", cs.getName());
		
		if(stepMeta.getStepErrorMeta() != null)
			e.setAttribute("error", StepErrorMetaCodec.encode(stepMeta.getStepErrorMeta()).toString());
		e.setAttribute("supports_error_handing", stepMeta.supportsErrorHandling() ? "Y" : "N");
		
		return e;
	}
	
	public abstract void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception;
	public abstract Element encode(StepMetaInterface stepMetaInterface) throws Exception;

}
