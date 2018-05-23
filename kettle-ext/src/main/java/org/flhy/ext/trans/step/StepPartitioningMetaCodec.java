package org.flhy.ext.trans.step;

import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.exception.KettlePluginException;
import org.pentaho.di.partition.PartitionSchema;
import org.pentaho.di.trans.ModPartitioner;
import org.pentaho.di.trans.Partitioner;
import org.pentaho.di.trans.step.StepPartitioningMeta;
import org.springframework.util.StringUtils;

public class StepPartitioningMetaCodec {

	public static JSONObject encode(StepPartitioningMeta stepPartitioningMeta) {
		JSONObject jsonObject = new JSONObject();
		
		jsonObject.put("method", stepPartitioningMeta.getMethodCode());
		PartitionSchema partitionSchema = stepPartitioningMeta.getPartitionSchema();
		jsonObject.put("schema_name", partitionSchema != null ? partitionSchema.getName() : "" );
		Partitioner partitioner = stepPartitioningMeta.getPartitioner();
		if(partitioner != null) {
			if(partitioner instanceof ModPartitioner) {
				ModPartitioner modPartitioner = (ModPartitioner) partitioner;
				jsonObject.put("field_name", modPartitioner.getFieldName());
			}
		}
		return jsonObject;
	}
	
	public static StepPartitioningMeta decode( JSONObject jsonObject ) throws KettlePluginException {
		StepPartitioningMeta stepPartitioningMeta = new StepPartitioningMeta();
		String method = jsonObject.optString("method");
		if(StringUtils.hasText(method))
			stepPartitioningMeta.setMethod(method);
		stepPartitioningMeta.setPartitionSchemaName(jsonObject.optString("schema_name"));
		Partitioner partitioner = stepPartitioningMeta.getPartitioner();
		if(partitioner != null) {
			if(partitioner instanceof ModPartitioner) {
				ModPartitioner modPartitioner = (ModPartitioner) partitioner;
				modPartitioner.setFieldName(jsonObject.optString("field_name"));
			}
		}
		return stepPartitioningMeta;
	}
}
