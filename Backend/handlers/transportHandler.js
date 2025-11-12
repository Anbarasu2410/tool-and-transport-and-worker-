import FleetTask from "../models/FleetTask.js";
import FleetTaskPassenger from "../models/FleetTaskPassenger.js";
import FleetTaskMaterial from "../models/FleetTaskMaterial.js";
import FleetTaskTool from "../models/FleetTaskTool.js";

export async function handleTransport(taskId, data, session) {
  try {
    // Generate new ID for fleet task
    const lastFleetTask = await FleetTask.findOne().sort({ id: -1 });
    const newFleetTaskId = lastFleetTask ? lastFleetTask.id + 1 : 1;

    // Create main fleet task
    const fleetTask = await FleetTask.create([{
      id: newFleetTaskId,
      taskId: taskId,
      driverId: data.driverId,
      vehicleId: data.vehicleId,
      transportType: data.transportType,
      pickupLocation: data.pickupLocation,
      dropLocation: data.dropLocation,
      pickupTime: data.pickupTime,
      dropTime: data.dropTime,
      companyId: data.companyId,
      projectId: data.projectId,
      taskDate: new Date(),
      plannedPickupTime: data.pickupTime,
      plannedDropTime: data.dropTime,
      status: 'PLANNED',
      createdBy: data.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { session });

    const fleetTaskId = fleetTask[0].id; // Use the numeric ID, not MongoDB _id

    // Worker passengers
    if (data.transportType === "WORKER_TRANSPORT" && data.workers && data.workers.length) {
      const passengers = data.workers.map((empId) => ({ 
        fleetTaskId: fleetTaskId, 
        workerEmployeeId: empId 
      }));
      await FleetTaskPassenger.insertMany(passengers, { session });
    }

    // Materials
    if (data.transportType === "MATERIAL_TRANSPORT" && data.materialQuantities && data.materialQuantities.length) {
      const materials = data.materialQuantities.map((material) => ({ 
        fleetTaskId: fleetTaskId, 
        materialId: material.materialId, 
        quantity: material.quantity 
      }));
      await FleetTaskMaterial.insertMany(materials, { session });
    }

    // Tools
    if (data.transportType === "TOOL_TRANSPORT" && data.toolQuantities && data.toolQuantities.length) {
      const tools = data.toolQuantities.map((tool) => ({ 
        fleetTaskId: fleetTaskId, 
        toolId: tool.toolId, 
        quantity: tool.quantity 
      }));
      await FleetTaskTool.insertMany(tools, { session });
    }

    console.log(`✅ Fleet task created: ${newFleetTaskId} for transport task`);

    return fleetTask[0].id; // Return MongoDB _id for Task reference
  } catch (error) {
    console.error('Error in transport handler:', error);
    throw error;
  }
}