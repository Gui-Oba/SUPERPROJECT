figma.showUI(__html__, { width: 300, height: 350 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'get-selection') {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify("Select layers to clean up 🧹");
      return;
    }

    const simplifiedLayers = selection.map(node => ({
      id: node.id,
      type: node.type,
      x: Math.round(node.x),
      y: Math.round(node.y),
      width: node.width,
      height: node.height,
      name: node.name
    }));

    figma.ui.postMessage({ type: 'selection-data', layers: simplifiedLayers });
  }

  if (msg.type === 'apply-cleanup') {
    const cleanupData = msg.data;
    let count = 0;

    for (const id in cleanupData) {
      const changes = cleanupData[id];
      const node = await figma.getNodeByIdAsync(id); // Use Async for Dynamic Page Access

      if (node && "resize" in node) {
        // Apply Name
        node.name = changes.name;
        
        // Apply Size and Position
        node.x = changes.x;
        node.y = changes.y;
        node.resize(changes.width, changes.height);

        // Apply Color if it's a geometry node
        if ("fills" in node && changes.color) {
          node.fills = [{
            type: 'SOLID',
            color: { r: changes.color.r, g: changes.color.g, b: changes.color.b }
          }];
        }
        count++;
      }
    }
    figma.notify(`Cleaned up ${count} layers! ✨`);
  }

  if (msg.type === 'cancel') figma.closePlugin();
};