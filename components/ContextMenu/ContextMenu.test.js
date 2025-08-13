import React from "react";
import { shallow } from "enzyme";
import ContextMenu from "./ContextMenu";

describe("ContextMenu", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<ContextMenu />);
    expect(wrapper).toMatchSnapshot();
  });
});
