import React from "react";
import { shallow } from "enzyme";
import FlowchartNode from "./FlowchartNode";

describe("FlowchartNode", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<FlowchartNode />);
    expect(wrapper).toMatchSnapshot();
  });
});
