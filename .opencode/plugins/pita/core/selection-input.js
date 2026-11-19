export const createSelectionInput = controller => ({
  handleKey: key => {
    if (controller.screen() !== "select" || key.eventType !== "press" && key.eventType !== "repeat") {
      return;
    }
    if (key.name === "space") {
      if (key.eventType === "press") {
        key.preventDefault();
        controller.toggle();
      }
      return;
    }
    if (key.name !== "up" && key.name !== "down") {
      return;
    }
    key.preventDefault();
    if (key.name === "up") {
      controller.prev();
    } else {
      controller.next();
    }
  }
});