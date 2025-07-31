import React from "react";
import { shallow } from "enzyme";
import FlowchartCanvas from "./FlowchartCanvas";

describe("FlowchartCanvas", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<FlowchartCanvas />);
    expect(wrapper).toMatchSnapshot();
  });
});
